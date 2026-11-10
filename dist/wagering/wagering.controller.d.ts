import { EntityManager } from '@mikro-orm/core';
import { ProcessWagerTransactionUseCase } from '../application/use-cases/process-wager-transaction.use-case';
import { WagerTransactionEntity } from '../infrastructure/entities/wager-transaction.entity';
interface SubmitTransactionDto {
    providerId: string;
    externalTransactionId: string;
    playerId: string;
    walletId: string;
    roundId: string;
    gameId: string;
    kind: 'BET' | 'WIN' | 'LOSS' | 'REFUND' | 'ROLLBACK';
    money: {
        amount: string;
        currency: string;
    };
    referenceExternalTransactionId?: string;
}
export declare class WageringController {
    private readonly useCase;
    private readonly em;
    constructor(useCase: ProcessWagerTransactionUseCase, em: EntityManager);
    submit(idempotencyKey: string, dto: SubmitTransactionDto): Promise<import("../application/use-cases/process-wager-transaction.use-case").ProcessWagerTransactionResult>;
    findOne(id: string): Promise<import("@mikro-orm/core").Loaded<WagerTransactionEntity, never, "*", never>>;
}
export {};
