"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20261108222349 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20261108222349 extends migrations_1.Migration {
    async up() {
        this.addSql(`create table "inbox_messages" ("id" uuid not null, "message_id" varchar(255) not null, "consumer_name" varchar(255) not null, "payload_hash" varchar(255) not null, "received_at" timestamptz not null, "processed_at" timestamptz null, constraint "inbox_messages_pkey" primary key ("id"));`);
        this.addSql(`alter table "inbox_messages" add constraint "inbox_messages_consumer_name_message_id_unique" unique ("consumer_name", "message_id");`);
        this.addSql(`create table "ledger_entries" ("id" uuid not null, "wallet_id" uuid not null, "transaction_id" uuid not null, "direction" varchar(10) not null, "amount" numeric(18,2) not null, "currency" varchar(3) not null, "balance_before" numeric(18,2) not null, "balance_after" numeric(18,2) not null, "created_at" timestamptz not null, constraint "ledger_entries_pkey" primary key ("id"));`);
        this.addSql(`create table "outbox_messages" ("id" uuid not null, "aggregate_id" uuid not null, "event_type" varchar(255) not null, "payload" jsonb not null, "occurred_at" timestamptz not null, "attempts" int not null default 0, "next_attempt_at" timestamptz null, "published_at" timestamptz null, constraint "outbox_messages_pkey" primary key ("id"));`);
        this.addSql(`create table "wager_transactions" ("id" uuid not null, "provider_id" varchar(255) not null, "external_transaction_id" varchar(255) not null, "idempotency_key" varchar(255) not null, "payload_hash" varchar(255) not null, "wallet_id" uuid not null, "player_id" uuid not null, "round_id" varchar(255) not null, "game_id" varchar(255) not null, "kind" varchar(20) not null, "amount" numeric(18,2) not null, "currency" varchar(3) not null, "reference_external_transaction_id" varchar(255) null, "reference_transaction_id" varchar(255) null, "status" varchar(30) not null, "failure_code" varchar(255) null, "created_at" timestamptz not null, "processed_at" timestamptz null, constraint "wager_transactions_pkey" primary key ("id"));`);
        this.addSql(`alter table "wager_transactions" add constraint "wager_transactions_provider_id_external_transaction_id_unique" unique ("provider_id", "external_transaction_id");`);
        this.addSql(`create table "wallets" ("id" uuid not null, "player_id" uuid not null, "currency" varchar(3) not null, "balance" numeric(18,2) not null, "version" int not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "wallets_pkey" primary key ("id"));`);
        this.addSql(`alter table "wallets" add constraint "wallets_player_id_currency_unique" unique ("player_id", "currency");`);
    }
    async down() {
        this.addSql(`drop table if exists "inbox_messages" cascade;`);
        this.addSql(`drop table if exists "ledger_entries" cascade;`);
        this.addSql(`drop table if exists "outbox_messages" cascade;`);
        this.addSql(`drop table if exists "wager_transactions" cascade;`);
        this.addSql(`drop table if exists "wallets" cascade;`);
    }
}
exports.Migration20261108222349 = Migration20261108222349;
//# sourceMappingURL=Migration20261108222349.js.map