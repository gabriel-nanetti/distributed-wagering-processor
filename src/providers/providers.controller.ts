import { Controller, Get, Param } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { WagerTransactionEntity } from '../infrastructure/entities/wager-transaction.entity';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly em: EntityManager) {}

  @Get(':providerId/wagering/transactions/:externalId')
  async findByProvider(
    @Param('providerId') providerId: string,
    @Param('externalId') externalTransactionId: string,
  ) {
    const entity = await this.em.findOne(WagerTransactionEntity, { providerId, externalTransactionId });
    if (!entity) throw new Error('TRANSACTION_NOT_FOUND');
    return entity;
  }
}