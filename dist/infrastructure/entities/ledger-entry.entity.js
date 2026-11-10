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
exports.LedgerEntryEntity = void 0;
const core_1 = require("@mikro-orm/core");
let LedgerEntryEntity = class LedgerEntryEntity {
    id;
    walletId;
    transactionId;
    direction;
    amount;
    currency;
    balanceBefore;
    balanceAfter;
    createdAt;
};
exports.LedgerEntryEntity = LedgerEntryEntity;
__decorate([
    (0, core_1.PrimaryKey)({ type: 'uuid' }),
    __metadata("design:type", String)
], LedgerEntryEntity.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ type: 'uuid' }),
    __metadata("design:type", String)
], LedgerEntryEntity.prototype, "walletId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'uuid' }),
    __metadata("design:type", String)
], LedgerEntryEntity.prototype, "transactionId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], LedgerEntryEntity.prototype, "direction", void 0);
__decorate([
    (0, core_1.Property)({ type: 'numeric', precision: 18, scale: 2 }),
    __metadata("design:type", String)
], LedgerEntryEntity.prototype, "amount", void 0);
__decorate([
    (0, core_1.Property)({ type: 'varchar', length: 3 }),
    __metadata("design:type", String)
], LedgerEntryEntity.prototype, "currency", void 0);
__decorate([
    (0, core_1.Property)({ type: 'numeric', precision: 18, scale: 2 }),
    __metadata("design:type", String)
], LedgerEntryEntity.prototype, "balanceBefore", void 0);
__decorate([
    (0, core_1.Property)({ type: 'numeric', precision: 18, scale: 2 }),
    __metadata("design:type", String)
], LedgerEntryEntity.prototype, "balanceAfter", void 0);
__decorate([
    (0, core_1.Property)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], LedgerEntryEntity.prototype, "createdAt", void 0);
exports.LedgerEntryEntity = LedgerEntryEntity = __decorate([
    (0, core_1.Entity)({ tableName: 'ledger_entries' })
], LedgerEntryEntity);
//# sourceMappingURL=ledger-entry.entity.js.map