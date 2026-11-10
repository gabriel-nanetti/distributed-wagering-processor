import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { WalletEntity } from './wallet.entity.js';

@Entity({ tableName: 'ledger_entries' })
export class LedgerEntryEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'uuid' })
  walletId!: string;

  @Property({ type: 'uuid' })
  transactionId!: string;

  @Property({ type: 'varchar', length: 10 })
  direction!: string; // 'DEBIT' | 'CREDIT'

  @Property({ type: 'numeric', precision: 18, scale: 2 })
  amount!: string;

  @Property({ type: 'varchar', length: 3 })
  currency!: string;

  @Property({ type: 'numeric', precision: 18, scale: 2 })
  balanceBefore!: string;

  @Property({ type: 'numeric', precision: 18, scale: 2 })
  balanceAfter!: string;

  @Property({ type: 'timestamptz' })
  createdAt!: Date;
}