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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvidersController = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@mikro-orm/core");
const wager_transaction_entity_1 = require("../infrastructure/entities/wager-transaction.entity");
let ProvidersController = class ProvidersController {
    em;
    constructor(em) {
        this.em = em;
    }
    async findByProvider(providerId, externalTransactionId) {
        const entity = await this.em.findOne(wager_transaction_entity_1.WagerTransactionEntity, { providerId, externalTransactionId });
        if (!entity)
            throw new Error('TRANSACTION_NOT_FOUND');
        return entity;
    }
};
exports.ProvidersController = ProvidersController;
__decorate([
    (0, common_1.Get)(':providerId/wagering/transactions/:externalId'),
    __param(0, (0, common_1.Param)('providerId')),
    __param(1, (0, common_1.Param)('externalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "findByProvider", null);
exports.ProvidersController = ProvidersController = __decorate([
    (0, common_1.Controller)('providers'),
    __metadata("design:paramtypes", [core_1.EntityManager])
], ProvidersController);
//# sourceMappingURL=providers.controller.js.map