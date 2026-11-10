import { EntityManager } from '@mikro-orm/core';
import { WagerTransactionEntity } from '../infrastructure/entities/wager-transaction.entity';
export declare class ProvidersController {
    private readonly em;
    constructor(em: EntityManager);
    findByProvider(providerId: string, externalTransactionId: string): Promise<import("@mikro-orm/core").Loaded<WagerTransactionEntity, never, "*", never>>;
}
