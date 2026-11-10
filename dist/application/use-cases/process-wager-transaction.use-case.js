"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessWagerTransactionUseCase = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@mikro-orm/core");
const wallet_repository_impl_1 = require("../../infrastructure/repositories/wallet.repository.impl");
const money_1 = require("../../domain/money/money");
const wager_transaction_entity_1 = require("../../infrastructure/entities/wager-transaction.entity");
const ledger_entry_entity_1 = require("../../infrastructure/entities/ledger-entry.entity");
const outbox_message_entity_1 = require("../../infrastructure/entities/outbox-message.entity");
const crypto = __importStar(require("crypto"));
const common_2 = require("@nestjs/common");
let ProcessWagerTransactionUseCase = class ProcessWagerTransactionUseCase {
    em;
    walletRepository;
    constructor(em, walletRepository) {
        this.em = em;
        this.walletRepository = walletRepository;
    }
    async execute(command) {
        return this.em.transactional(async (em) => {
            const existing = await em.findOne(wager_transaction_entity_1.WagerTransactionEntity, {
                idempotencyKey: command.idempotencyKey,
            });
            if (existing) {
                console.log('--- DEBUG IDEMPOTENCY ---');
                console.log('Saved Hash:', existing.payloadHash);
                console.log('Command Hash:', command.payloadHash);
                if (existing.payloadHash !== command.payloadHash) {
                    throw new common_2.ConflictException('IDEMPOTENCY_CONFLICT');
                }
                const wallet = await this.walletRepository.findById(command.walletId, em);
                return {
                    transactionId: existing.id,
                    status: existing.status,
                    balance: wallet.balance.toJSON(),
                    idempotentReplay: true,
                };
            }
            const wallet = await this.walletRepository.findByIdWithLock(command.walletId, em);
            if (!wallet)
                throw new Error('WALLET_NOT_FOUND');
            const money = money_1.Money.from(command.money);
            const transactionId = crypto.randomUUID();
            const now = new Date();
            let status = 'PROCESSED';
            let failureCode;
            let ledgerEntry = null;
            try {
                if (command.kind === 'BET') {
                    const entry = wallet.debit(money);
                    ledgerEntry = {
                        direction: 'DEBIT',
                        amount: entry.amount.toJSON().amount,
                        balanceBefore: entry.balanceBefore.toJSON().amount,
                        balanceAfter: entry.balanceAfter.toJSON().amount,
                    };
                }
                else if (command.kind === 'WIN' || command.kind === 'REFUND') {
                    const entry = wallet.credit(money);
                    ledgerEntry = {
                        direction: 'CREDIT',
                        amount: entry.amount.toJSON().amount,
                        balanceBefore: entry.balanceBefore.toJSON().amount,
                        balanceAfter: entry.balanceAfter.toJSON().amount,
                    };
                }
                else if (command.kind === 'LOSS') {
                    status = 'PROCESSED';
                }
            }
            catch (e) {
                status = 'REJECTED';
                failureCode = 'INSUFFICIENT_BALANCE';
            }
            const transaction = em.create(wager_transaction_entity_1.WagerTransactionEntity, {
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
            if (ledgerEntry && status === 'PROCESSED') {
                const entry = em.create(ledger_entry_entity_1.LedgerEntryEntity, {
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
            const outbox = em.create(outbox_message_entity_1.OutboxMessageEntity, {
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
};
exports.ProcessWagerTransactionUseCase = ProcessWagerTransactionUseCase;
exports.ProcessWagerTransactionUseCase = ProcessWagerTransactionUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.EntityManager,
        wallet_repository_impl_1.WalletRepositoryImpl])
], ProcessWagerTransactionUseCase);
//# sourceMappingURL=process-wager-transaction.use-case.js.map