import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ProcessWagerTransactionUseCase } from '../../application/use-cases/process-wager-transaction.use-case';
export declare class SqsConsumer implements OnModuleInit, OnModuleDestroy {
    private readonly em;
    private readonly useCase;
    private readonly logger;
    private readonly sqs;
    private running;
    constructor(em: EntityManager, useCase: ProcessWagerTransactionUseCase);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private poll;
    private processMessage;
    private ack;
    private sleep;
}
