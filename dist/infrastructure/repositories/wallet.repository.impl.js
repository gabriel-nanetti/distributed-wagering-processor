"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletRepositoryImpl = void 0;
const core_1 = require("@mikro-orm/core");
const common_1 = require("@nestjs/common");
const wallet_1 = require("../../domain/wallet/wallet");
const wallet_entity_1 = require("../entities/wallet.entity");
let WalletRepositoryImpl = class WalletRepositoryImpl {
    em;
    constructor(em) {
        this.em = em;
    }
    async findById(id, em) {
        const manager = em || this.em;
        const entity = await manager.findOne(wallet_entity_1.WalletEntity, { id });
        if (!entity)
            return null;
        return this.toDomain(entity);
    }
    async findByPlayerAndCurrency(playerId, currency, em) {
        const manager = em || this.em;
        const entity = await manager.findOne(wallet_entity_1.WalletEntity, { playerId, currency });
        if (!entity)
            return null;
        return this.toDomain(entity);
    }
    async findByIdWithLock(id, em) {
        const manager = em || this.em;
        const entity = await manager.findOne(wallet_entity_1.WalletEntity, { id }, { lockMode: core_1.LockMode.PESSIMISTIC_WRITE });
        if (!entity)
            return null;
        return this.toDomain(entity);
    }
    async save(wallet, em) {
        const manager = em || this.em;
        const existing = await manager.findOne(wallet_entity_1.WalletEntity, { id: wallet.id });
        if (existing) {
            existing.balance = wallet.balance.toJSON().amount;
            existing.version = wallet.version;
            existing.updatedAt = wallet.updatedAt;
        }
        else {
            const entity = manager.create(wallet_entity_1.WalletEntity, {
                id: wallet.id,
                playerId: wallet.playerId,
                currency: wallet.currency,
                balance: wallet.balance.toJSON().amount,
                version: wallet.version,
                createdAt: wallet.createdAt,
                updatedAt: wallet.updatedAt,
            });
            manager.persist(entity);
        }
    }
    toDomain(entity) {
        return wallet_1.Wallet.rehydrate({
            id: entity.id,
            playerId: entity.playerId,
            currency: entity.currency,
            balance: entity.balance,
            version: entity.version,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }
};
exports.WalletRepositoryImpl = WalletRepositoryImpl;
exports.WalletRepositoryImpl = WalletRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.EntityManager])
], WalletRepositoryImpl);
//# sourceMappingURL=wallet.repository.impl.js.map