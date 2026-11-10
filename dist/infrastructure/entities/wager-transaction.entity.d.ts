export declare class WagerTransactionEntity {
    id: string;
    providerId: string;
    externalTransactionId: string;
    idempotencyKey: string;
    payloadHash: string;
    walletId: string;
    playerId: string;
    roundId: string;
    gameId: string;
    kind: string;
    amount: string;
    currency: string;
    referenceExternalTransactionId?: string;
    referenceTransactionId?: string;
    status: string;
    failureCode?: string;
    createdAt: Date;
    processedAt?: Date;
}
