import { Body, Controller, Post, Get, Param, Query, HttpCode } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { WalletEntity } from '../infrastructure/entities/wallet.entity';
import { LedgerEntryEntity } from '../infrastructure/entities/ledger-entry.entity';
import { Money } from '../domain/money/money';
import * as crypto from 'crypto';
import Decimal from 'decimal.js';

interface CreateWalletDto {
  playerId: string;
  initialBalance: { amount: string; currency: string } | string;
  currency?: string;
}

@Controller('wallets')
export class WalletsController {
  constructor(private readonly em: EntityManager) {}

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateWalletDto): Promise<{ id: string; playerId: string; balance: { amount: string; currency: string }; version: number }> {
    const money = typeof dto.initialBalance === 'string'
      ? Money.from({ amount: dto.initialBalance, currency: dto.currency ?? 'BRL' })
      : Money.from(dto.initialBalance);

    const id = crypto.randomUUID();
    const now = new Date();

    await this.em.transactional(async (em) => {
      const wallet = em.create(WalletEntity, {
        id,
        playerId: dto.playerId,
        currency: money.currency,
        balance: money.toJSON().amount,
        version: 1,
        createdAt: now,
        updatedAt: now,
      });
      em.persist(wallet);
    });

    return { id, playerId: dto.playerId, balance: money.toJSON(), version: 1 };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const entity = await this.em.findOne(WalletEntity, { id });
    if (!entity) throw new Error('WALLET_NOT_FOUND');
    return {
      id: entity.id,
      playerId: entity.playerId,
      balance: { amount: entity.balance, currency: entity.currency },
      version: entity.version,
    };
  }

  @Get(':id/ledger')
  async ledger(@Param('id') walletId: string, @Query('cursor') cursor?: string, @Query('limit') limit = '50') {
    const take = Math.min(Number(limit), 100);
    const where: any = { walletId };
    if (cursor) {
      where.id = { $gt: cursor };
    }
    const entries = await this.em.find(LedgerEntryEntity, where, {
      orderBy: { createdAt: 'ASC' },
      limit: take + 1,
    });

    const hasMore = entries.length > take;
    const data = hasMore ? entries.slice(0, take) : entries;

    return {
      data: data.map(e => ({
        id: e.id,
        direction: e.direction,
        amount: { amount: e.amount, currency: e.currency },
        balanceBefore: { amount: e.balanceBefore, currency: e.currency },
        balanceAfter: { amount: e.balanceAfter, currency: e.currency },
        createdAt: e.createdAt,
      })),
      nextCursor: hasMore ? data[data.length - 1].id : null,
    };
  }

  @Post(':id/reconciliation')
async reconcile(@Param('id') walletId: string) {
  const wallet = await this.em.findOne(WalletEntity, { id: walletId });
  if (!wallet) throw new Error('WALLET_NOT_FOUND');

  const entries = await this.em.find(LedgerEntryEntity, { walletId }, {
    orderBy: { createdAt: 'ASC' },
  });

  let calculated = new Decimal(0);
  for (const entry of entries) {
    if (entry.direction === 'CREDIT') {
      calculated = calculated.plus(entry.amount);
    } else {
      calculated = calculated.minus(entry.amount);
    }
  }

  // Soma o saldo inicial (antes do primeiro ledger)
  const firstEntry = entries[0];
  if (firstEntry) {
    calculated = calculated.plus(firstEntry.balanceBefore);
  }

  const stored = new Decimal(wallet.balance);
  const difference = stored.minus(calculated).abs();
  const consistent = difference.isZero();

  if (!consistent) {
    console.error(`RECONCILIATION_DIVERGENCE walletId=${walletId} stored=${stored} calculated=${calculated}`);
  }

  return {
    walletId,
    storedBalance: { amount: wallet.balance, currency: wallet.currency },
    calculatedBalance: { amount: calculated.toFixed(2), currency: wallet.currency },
    difference: { amount: difference.toFixed(2), currency: wallet.currency },
    consistent,
    checkedEntries: entries.length,
  };
}
}