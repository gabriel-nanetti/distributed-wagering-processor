import { EntityManager } from '@mikro-orm/core';
interface CreateWalletDto {
    playerId: string;
    initialBalance: {
        amount: string;
        currency: string;
    } | string;
    currency?: string;
}
export declare class WalletsController {
    private readonly em;
    constructor(em: EntityManager);
    create(dto: CreateWalletDto): Promise<{
        id: string;
        playerId: string;
        balance: {
            amount: string;
            currency: string;
        };
        version: number;
    }>;
    findOne(id: string): Promise<{
        id: string;
        playerId: string;
        balance: {
            amount: string;
            currency: string;
        };
        version: number;
    }>;
    ledger(walletId: string, cursor?: string, limit?: string): Promise<{
        data: {
            id: string;
            direction: string;
            amount: {
                amount: string;
                currency: string;
            };
            balanceBefore: {
                amount: string;
                currency: string;
            };
            balanceAfter: {
                amount: string;
                currency: string;
            };
            createdAt: Date;
        }[];
        nextCursor: string | null;
    }>;
    reconcile(walletId: string): Promise<{
        walletId: string;
        storedBalance: {
            amount: string;
            currency: string;
        };
        calculatedBalance: {
            amount: string;
            currency: string;
        };
        difference: {
            amount: string;
            currency: string;
        };
        consistent: boolean;
        checkedEntries: number;
    }>;
}
export {};
