"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const postgresql_1 = require("@mikro-orm/postgresql");
const migrations_1 = require("@mikro-orm/migrations");
const wallet_entity_1 = require("../entities/wallet.entity");
const ledger_entry_entity_1 = require("../entities/ledger-entry.entity");
const wager_transaction_entity_1 = require("../entities/wager-transaction.entity");
const inbox_message_entity_1 = require("../entities/inbox-message.entity");
const outbox_message_entity_1 = require("../entities/outbox-message.entity");
exports.default = (0, postgresql_1.defineConfig)({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'wager',
    password: process.env.DB_PASSWORD ?? 'wager',
    dbName: process.env.DB_NAME ?? 'wager_db',
    entities: [
        wallet_entity_1.WalletEntity,
        ledger_entry_entity_1.LedgerEntryEntity,
        wager_transaction_entity_1.WagerTransactionEntity,
        inbox_message_entity_1.InboxMessageEntity,
        outbox_message_entity_1.OutboxMessageEntity,
    ],
    migrations: {
        path: 'dist/infrastructure/database/migrations',
        pathTs: 'src/infrastructure/database/migrations',
    },
    extensions: [migrations_1.Migrator],
});
//# sourceMappingURL=mikro-orm.config.js.map