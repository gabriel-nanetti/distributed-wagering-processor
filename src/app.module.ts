import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { WageringController } from './wagering/wagering.controller';
import { WalletsController } from './wallets/wallets.controller';
import { ProcessWagerTransactionUseCase } from './application/use-cases/process-wager-transaction.use-case';
import { WalletRepositoryImpl } from './infrastructure/repositories/wallet.repository.impl';
import config from './infrastructure/database/mikro-orm.config';
import { SqsConsumer } from './infrastructure/messaging/sqs.consumer';
import { OutboxWorker } from './infrastructure/messaging/outbox.worker'; 
import { ProvidersController } from './providers/providers.controller';
import { HealthController } from './health/health.controller';

@Module({
  imports: [MikroOrmModule.forRoot(config)],
  controllers: [WageringController, WalletsController, ProvidersController, HealthController],
  providers: [
    ProcessWagerTransactionUseCase,
    WalletRepositoryImpl,
    SqsConsumer,
    OutboxWorker, // Adicionado aqui
  ],
})
export class AppModule {}