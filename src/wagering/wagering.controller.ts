import { Body, Controller, Headers, Post, Get, Param, HttpCode } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ProcessWagerTransactionUseCase } from '../application/use-cases/process-wager-transaction.use-case';
import { WagerTransactionEntity } from '../infrastructure/entities/wager-transaction.entity';
import * as crypto from 'crypto';

interface SubmitTransactionDto {
  providerId: string;
  externalTransactionId: string;
  playerId: string;
  walletId: string;
  roundId: string;
  gameId: string;
  kind: 'BET' | 'WIN' | 'LOSS' | 'REFUND' | 'ROLLBACK';
  money: { amount: string; currency: string };
  referenceExternalTransactionId?: string;
}

@Controller('wagering')
export class WageringController {
  constructor(
    private readonly useCase: ProcessWagerTransactionUseCase,
    private readonly em: EntityManager,
  ) {}

  @Post('transactions')
  @HttpCode(200)
  async submit(
    @Headers('idempotency-key') idempotencyKey: string,
    @Body() dto: SubmitTransactionDto,
  ) {
    if (!idempotencyKey) {
      throw new Error('MISSING_IDEMPOTENCY_KEY');
    }

    const payloadString = `${dto.providerId}|${dto.externalTransactionId}|${dto.playerId}|${dto.walletId}|${dto.roundId}|${dto.gameId}|${dto.kind}|${dto.money?.amount}|${dto.money?.currency}|${dto.referenceExternalTransactionId || ''}`;

    const payloadHash = crypto
      .createHash('sha256')
      .update(payloadString)
      .digest('hex');

    return this.useCase.execute({
      ...dto,
      idempotencyKey,
      payloadHash,
      correlationId: crypto.randomUUID(),
    });
  }

  @Get('transactions/:id')
  async findOne(@Param('id') id: string) {
    const entity = await this.em.findOne(WagerTransactionEntity, { id });
    if (!entity) throw new Error('TRANSACTION_NOT_FOUND');
    return entity;
  }
}