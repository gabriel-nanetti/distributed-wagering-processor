import { EntityManager } from '@mikro-orm/core';
import { Wallet } from '../../domain/wallet/wallet';
import { WalletRepository } from '../../domain/wallet/wallet.repository';
export declare class WalletRepositoryImpl implements WalletRepository {
    private readonly em;
    constructor(em: EntityManager);
    findById(id: string, em?: EntityManager): Promise<Wallet | null>;
    findByPlayerAndCurrency(playerId: string, currency: string, em?: EntityManager): Promise<Wallet | null>;
    findByIdWithLock(id: string, em?: EntityManager): Promise<Wallet | null>;
    save(wallet: Wallet, em?: EntityManager): Promise<void>;
    private toDomain;
}
