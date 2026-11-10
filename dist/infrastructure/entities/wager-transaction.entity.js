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
exports.WagerTransactionEntity = void 0;
const core_1 = require("@mikro-orm/core");
let WagerTransactionEntity = class WagerTransactionEntity {
    id;
    providerId;
    externalTransactionId;
    idempotencyKey;
    payloadHash;
    walletId;
    playerId;
    roundId;
    gameId;
    kind;
    amount;
    currency;
    referenceExternalTransactionId;
    referenceTransactionId;
    status;
    failureCode;
    createdAt;
    processedAt;
};
exports.WagerTransactionEntity = WagerTransactionEntity;
__decorate([
    (0, core_1.PrimaryKey)({ type: 'uuid' }),
    __metadata("design:type", String)
], WagerTransactionEntity.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ type: 'varchar' }),
    __metadata("design:type", String)
], WagerTransactionEntity.prototype, "providerId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'varchar' }),
    __metadata("design:type", String)
], WagerTransactionEntity.prototype, "externalTransactionId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'varchar' }),
    __metadata("design:type", String)
], WagerTransactionEntity.prototype, "idempotencyKey", void 0);
__decorate([
    (0, core_1.Property)({ type: 'varchar' }),
    __metadata("design:type", String)
], WagerTransactionEntity.prototype, "payloadHash", void 0);
__decorate([
    (0, core_1.Property)({ type: 'uuid' }),
    __metadata("design:type", String)
], WagerTransactionEntity.prototype, "walletId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'uuid' }),
    __metadata("design:type", String)
], WagerTransactionEntity.prototype, "playerId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'varchar' }),
    __metadata("design:type", String)
], WagerTransactionEntity.prototype, "roundId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'varchar' }),
    __metadata("design:type", String)
], WagerTransactionEntity.prototype, "gameId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], WagerTransactionEntity.prototype, "kind", void 0);
__decorate([
    (0, core_1.Property)({ type: 'numeric', precision: 18, scale: 2 }),
    __metadata("design:type", String)
], WagerTransactionEntity.prototype, "amount", void 0);
__decorate([
    (0, core_1.Property)({ type: 'varchar', length: 3 }),
    __metadata("design:type", String)
], WagerTransactionEntity.prototype, "currency", void 0);
__decorate([
    (0, core_1.Property)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], WagerTransactionEntity.prototype, "referenceExternalTransactionId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], WagerTransactionEntity.prototype, "referenceTransactionId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'varchar', length: 30 }),
    __metadata("design:type", String)
], WagerTransactionEntity.prototype, "status", void 0);
__decorate([
    (0, core_1.Property)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], WagerTransactionEntity.prototype, "failureCode", void 0);
__decorate([
    (0, core_1.Property)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], WagerTransactionEntity.prototype, "createdAt", void 0);
__decorate([
    (0, core_1.Property)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], WagerTransactionEntity.prototype, "processedAt", void 0);
exports.WagerTransactionEntity = WagerTransactionEntity = __decorate([
    (0, core_1.Entity)({ tableName: 'wager_transactions' }),
    (0, core_1.Unique)({ properties: ['providerId', 'externalTransactionId'] })
], WagerTransactionEntity);
//# sourceMappingURL=wager-transaction.entity.js.map