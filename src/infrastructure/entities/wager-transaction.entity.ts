import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity({ tableName: 'wager_transactions' })
@Unique({ properties: ['providerId', 'externalTransactionId'] })
export class WagerTransactionEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'varchar' })
  providerId!: string;

  @Property({ type: 'varchar' })
  externalTransactionId!: string;

  @Property({ type: 'varchar' })
  idempotencyKey!: string;

  @Property({ type: 'varchar' })
  payloadHash!: string;

  @Property({ type: 'uuid' })
  walletId!: string;

  @Property({ type: 'uuid' })
  playerId!: string;

  @Property({ type: 'varchar' })
  roundId!: string;

  @Property({ type: 'varchar' })
  gameId!: string;

  @Property({ type: 'varchar', length: 20 })
  kind!: string;

  @Property({ type: 'numeric', precision: 18, scale: 2 })
  amount!: string;

  @Property({ type: 'varchar', length: 3 })
  currency!: string;

  @Property({ type: 'varchar', nullable: true })
  referenceExternalTransactionId?: string;

  @Property({ type: 'varchar', nullable: true })
  referenceTransactionId?: string;

  @Property({ type: 'varchar', length: 30 })
  status!: string;

  @Property({ type: 'varchar', nullable: true })
  failureCode?: string;

  @Property({ type: 'timestamptz' })
  createdAt!: Date;

  @Property({ type: 'timestamptz', nullable: true })
  processedAt?: Date;
}