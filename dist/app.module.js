"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@mikro-orm/nestjs");
const wagering_controller_1 = require("./wagering/wagering.controller");
const wallets_controller_1 = require("./wallets/wallets.controller");
const process_wager_transaction_use_case_1 = require("./application/use-cases/process-wager-transaction.use-case");
const wallet_repository_impl_1 = require("./infrastructure/repositories/wallet.repository.impl");
const mikro_orm_config_1 = __importDefault(require("./infrastructure/database/mikro-orm.config"));
const sqs_consumer_1 = require("./infrastructure/messaging/sqs.consumer");
const outbox_worker_1 = require("./infrastructure/messaging/outbox.worker");
const providers_controller_1 = require("./providers/providers.controller");
const health_controller_1 = require("./health/health.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [nestjs_1.MikroOrmModule.forRoot(mikro_orm_config_1.default)],
        controllers: [wagering_controller_1.WageringController, wallets_controller_1.WalletsController, providers_controller_1.ProvidersController, health_controller_1.HealthController],
        providers: [
            process_wager_transaction_use_case_1.ProcessWagerTransactionUseCase,
            wallet_repository_impl_1.WalletRepositoryImpl,
            sqs_consumer_1.SqsConsumer,
            outbox_worker_1.OutboxWorker,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map