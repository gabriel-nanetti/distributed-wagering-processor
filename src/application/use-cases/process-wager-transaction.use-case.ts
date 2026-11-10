import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { WalletRepositoryImpl } from '../../infrastructure/repositories/wallet.repository.impl';
import { Money } from '../../domain/money/money';
import { WagerTransactionEntity } from '../../infrastructure/entities/wager-transaction.entity';
import { LedgerEntryEntity } from '../../infrastructure/entities/ledger-entry.entity';
import { OutboxMessageEntity } from '../../infrastructure/entities/outbox-message.entity';
import * as crypto from 'crypto';
import { ConflictException } from '@nestjs/common';

export interface ProcessWagerTransactionCommand {
  providerId: string;
  externalTransactionId: string;
  idempotencyKey: string;
  payloadHash: string;
  playerId: string;
  walletId: string;
  roundId: string;
  gameId: string;
  kind: 'BET' | 'WIN' | 'LOSS' | 'REFUND' | 'ROLLBACK';
  money: { amount: string; currency: string };
  referenceExternalTransactionId?: string;
  correlationId: string;
}

export interface ProcessWagerTransactionResult {
  transactionId: string;
  status: string;
  balance: { amount: string; currency: string };
  idempotentReplay: boolean;
}

@Injectable()
export class ProcessWagerTransactionUseCase {
  constructor(
    private readonly em: EntityManager,
    private readonly walletRepository: WalletRepositoryImpl,
  ) {}

  async execute(command: ProcessWagerTransactionCommand): Promise<ProcessWagerTransactionResult> {
    return this.em.transactional(async (em) => {
      // 1. Idempotência — verifica se já foi processado
      const existing = await em.findOne(WagerTransactionEntity, {
        idempotencyKey: command.idempotencyKey,
      });

      if (existing) {
        console.log('--- DEBUG IDEMPOTENCY ---');
        console.log('Saved Hash:', existing.payloadHash);
        console.log('Command Hash:', command.payloadHash);

        if (existing.payloadHash !== command.payloadHash) {
          throw new ConflictException('IDEMPOTENCY_CONFLICT');
        }
        // Usa o em transacional para garantir consistência no replay
        const wallet = await this.walletRepository.findById(command.walletId, em);
        return {
          transactionId: existing.id,
          status: existing.status,
          balance: wallet!.balance.toJSON(),
          idempotentReplay: true,
        };
      }

      // 2. Busca wallet com lock pessimista usando o em transacional
      const wallet = await this.walletRepository.findByIdWithLock(command.walletId, em);
      if (!wallet) throw new Error('WALLET_NOT_FOUND');

      const money = Money.from(command.money);
      const transactionId = crypto.randomUUID();
      const now = new Date();
      let status = 'PROCESSED';
      let failureCode: string | undefined;
      let ledgerEntry: { direction: string; amount: string; balanceBefore: string; balanceAfter: string } | null = null;

      // 3. Aplica operação
      try {
        if (command.kind === 'BET') {
          const entry = wallet.debit(money);
          ledgerEntry = {
            direction: 'DEBIT',
            amount: entry.amount.toJSON().amount,
            balanceBefore: entry.balanceBefore.toJSON().amount,
            balanceAfter: entry.balanceAfter.toJSON().amount,
          };
        } else if (command.kind === 'WIN' || command.kind === 'REFUND') {
          const entry = wallet.credit(money);
          ledgerEntry = {
            direction: 'CREDIT',
            amount: entry.amount.toJSON().amount,
            balanceBefore: entry.balanceBefore.toJSON().amount,
            balanceAfter: entry.balanceAfter.toJSON().amount,
          };
        } else if (command.kind === 'LOSS') {
          // LOSS não altera saldo, mas é uma transação válida processada
          status = 'PROCESSED';
        }
      } catch (e: any) {
        status = 'REJECTED';
        failureCode = 'INSUFFICIENT_BALANCE';
      }

      // 4. Persiste a transação
      const transaction = em.create(WagerTransactionEntity, {
        id: transactionId,
        providerId: command.providerId,
        externalTransactionId: command.externalTransactionId,
        idempotencyKey: command.idempotencyKey,
        payloadHash: command.payloadHash,
        walletId: command.walletId,
        playerId: command.playerId,
        roundId: command.roundId,
        gameId: command.gameId,
        kind: command.kind,
        amount: command.money.amount,
        currency: command.money.currency,
        referenceExternalTransactionId: command.referenceExternalTransactionId,
        status,
        failureCode,
        createdAt: now,
        processedAt: now,
      });
      em.persist(transaction);

      // 5. Persiste ledger e salva wallet (se houve movimentação financeira e foi aprovada)
      if (ledgerEntry && status === 'PROCESSED') {
        const entry = em.create(LedgerEntryEntity, {
          id: crypto.randomUUID(),
          walletId: command.walletId,
          transactionId,
          direction: ledgerEntry.direction,
          amount: ledgerEntry.amount,
          currency: command.money.currency,
          balanceBefore: ledgerEntry.balanceBefore,
          balanceAfter: ledgerEntry.balanceAfter,
          createdAt: now,
        });
        em.persist(entry);

        await this.walletRepository.save(wallet, em);
      }

      // 6. Outbox
      const outbox = em.create(OutboxMessageEntity, {
        id: crypto.randomUUID(),
        aggregateId: command.walletId,
        eventType: status === 'PROCESSED' ? 'WagerTransactionProcessed' : 'WagerTransactionRejected',
        payload: {
          transactionId,
          walletId: command.walletId,
          kind: command.kind,
          status,
          correlationId: command.correlationId,
        },
        occurredAt: now,
        attempts: 0,
      });
      em.persist(outbox);

      return {
        transactionId,
        status,
        balance: wallet.balance.toJSON(),
        idempotentReplay: false,
      };
    });
  }
}