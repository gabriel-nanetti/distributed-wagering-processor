import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
export declare class OutboxWorker implements OnModuleInit, OnModuleDestroy {
    private readonly em;
    private readonly logger;
    private readonly sqs;
    private running;
    private timer;
    constructor(em: EntityManager);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private startPolling;
    private processPendingEvents;
}
