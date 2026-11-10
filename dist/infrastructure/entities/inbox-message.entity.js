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
exports.InboxMessageEntity = void 0;
const core_1 = require("@mikro-orm/core");
let InboxMessageEntity = class InboxMessageEntity {
    id;
    messageId;
    consumerName;
    payloadHash;
    receivedAt;
    processedAt;
};
exports.InboxMessageEntity = InboxMessageEntity;
__decorate([
    (0, core_1.PrimaryKey)({ type: 'uuid' }),
    __metadata("design:type", String)
], InboxMessageEntity.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ type: 'varchar' }),
    __metadata("design:type", String)
], InboxMessageEntity.prototype, "messageId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'varchar' }),
    __metadata("design:type", String)
], InboxMessageEntity.prototype, "consumerName", void 0);
__decorate([
    (0, core_1.Property)({ type: 'varchar' }),
    __metadata("design:type", String)
], InboxMessageEntity.prototype, "payloadHash", void 0);
__decorate([
    (0, core_1.Property)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], InboxMessageEntity.prototype, "receivedAt", void 0);
__decorate([
    (0, core_1.Property)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], InboxMessageEntity.prototype, "processedAt", void 0);
exports.InboxMessageEntity = InboxMessageEntity = __decorate([
    (0, core_1.Entity)({ tableName: 'inbox_messages' }),
    (0, core_1.Unique)({ properties: ['consumerName', 'messageId'] })
], InboxMessageEntity);
//# sourceMappingURL=inbox-message.entity.js.map