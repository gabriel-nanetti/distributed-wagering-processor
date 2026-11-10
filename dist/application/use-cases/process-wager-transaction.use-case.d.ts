import { EntityManager } from '@mikro-orm/core';
import { WalletRepositoryImpl } from '../../infrastructure/repositories/wallet.repository.impl';
export interface ProcessWagerTransactionCommand {
    providerId: string;
    externalTransactionId: string;
    idempotencyKey: string;
    payloadHash: string;
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
    correlationId: string;
}
export interface ProcessWagerTransactionResult {
    transactionId: string;
    status: string;
    balance: {
        amount: string;
        currency: string;
    };
    idempotentReplay: boolean;
}
export declare class ProcessWagerTransactionUseCase {
    private readonly em;
    private readonly walletRepository;
    constructor(em: EntityManager, walletRepository: WalletRepositoryImpl);
    execute(command: ProcessWagerTransactionCommand): Promise<ProcessWagerTransactionResult>;
}
