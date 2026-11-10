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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletsController = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@mikro-orm/core");
const wallet_entity_1 = require("../infrastructure/entities/wallet.entity");
const ledger_entry_entity_1 = require("../infrastructure/entities/ledger-entry.entity");
const money_1 = require("../domain/money/money");
const crypto = __importStar(require("crypto"));
const decimal_js_1 = __importDefault(require("decimal.js"));
let WalletsController = class WalletsController {
    em;
    constructor(em) {
        this.em = em;
    }
    async create(dto) {
        const money = typeof dto.initialBalance === 'string'
            ? money_1.Money.from({ amount: dto.initialBalance, currency: dto.currency ?? 'BRL' })
            : money_1.Money.from(dto.initialBalance);
        const id = crypto.randomUUID();
        const now = new Date();
        await this.em.transactional(async (em) => {
            const wallet = em.create(wallet_entity_1.WalletEntity, {
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
    async findOne(id) {
        const entity = await this.em.findOne(wallet_entity_1.WalletEntity, { id });
        if (!entity)
            throw new Error('WALLET_NOT_FOUND');
        return {
            id: entity.id,
            playerId: entity.playerId,
            balance: { amount: entity.balance, currency: entity.currency },
            version: entity.version,
        };
    }
    async ledger(walletId, cursor, limit = '50') {
        const take = Math.min(Number(limit), 100);
        const where = { walletId };
        if (cursor) {
            where.id = { $gt: cursor };
        }
        const entries = await this.em.find(ledger_entry_entity_1.LedgerEntryEntity, where, {
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
    async reconcile(walletId) {
        const wallet = await this.em.findOne(wallet_entity_1.WalletEntity, { id: walletId });
        if (!wallet)
            throw new Error('WALLET_NOT_FOUND');
        const entries = await this.em.find(ledger_entry_entity_1.LedgerEntryEntity, { walletId }, {
            orderBy: { createdAt: 'ASC' },
        });
        let calculated = new decimal_js_1.default(0);
        for (const entry of entries) {
            if (entry.direction === 'CREDIT') {
                calculated = calculated.plus(entry.amount);
            }
            else {
                calculated = calculated.minus(entry.amount);
            }
        }
        const firstEntry = entries[0];
        if (firstEntry) {
            calculated = calculated.plus(firstEntry.balanceBefore);
        }
        const stored = new decimal_js_1.default(wallet.balance);
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
};
exports.WalletsController = WalletsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/ledger'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('cursor')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "ledger", null);
__decorate([
    (0, common_1.Post)(':id/reconciliation'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "reconcile", null);
exports.WalletsController = WalletsController = __decorate([
    (0, common_1.Controller)('wallets'),
    __metadata("design:paramtypes", [core_1.EntityManager])
], WalletsController);
//# sourceMappingURL=wallets.controller.js.map