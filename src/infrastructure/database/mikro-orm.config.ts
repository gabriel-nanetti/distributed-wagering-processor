import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { WalletEntity } from '../entities/wallet.entity';
import { LedgerEntryEntity } from '../entities/ledger-entry.entity';
import { WagerTransactionEntity } from '../entities/wager-transaction.entity';
import { InboxMessageEntity } from '../entities/inbox-message.entity';
import { OutboxMessageEntity } from '../entities/outbox-message.entity';

export default defineConfig({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER ?? 'wager',
  password: process.env.DB_PASSWORD ?? 'wager',
  dbName: process.env.DB_NAME ?? 'wager_db',
  entities: [
    WalletEntity,
    LedgerEntryEntity,
    WagerTransactionEntity,
    InboxMessageEntity,
    OutboxMessageEntity,
  ],
  migrations: {
    path: 'dist/infrastructure/database/migrations',
    pathTs: 'src/infrastructure/database/migrations',
  },
  extensions: [Migrator],
});