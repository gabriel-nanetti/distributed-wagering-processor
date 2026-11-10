import { EntityManager, LockMode } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Wallet } from '../../domain/wallet/wallet';
import { WalletRepository } from '../../domain/wallet/wallet.repository';
import { WalletEntity } from '../entities/wallet.entity';
import { Money } from '../../domain/money/money';

@Injectable()
export class WalletRepositoryImpl implements WalletRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string, em?: EntityManager): Promise<Wallet | null> {
    const manager = em || this.em;
    const entity = await manager.findOne(WalletEntity, { id });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findByPlayerAndCurrency(playerId: string, currency: string, em?: EntityManager): Promise<Wallet | null> {
    const manager = em || this.em;
    const entity = await manager.findOne(WalletEntity, { playerId, currency });
    if (!entity) return null;
    return this.toDomain(entity);
  }
  
  async findByIdWithLock(id: string, em?: EntityManager): Promise<Wallet | null> {
    const manager = em || this.em;
    const entity = await manager.findOne(
      WalletEntity,
      { id },
      { lockMode: LockMode.PESSIMISTIC_WRITE },
    );
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async save(wallet: Wallet, em?: EntityManager): Promise<void> {
    const manager = em || this.em;
    const existing = await manager.findOne(WalletEntity, { id: wallet.id });
    if (existing) {
      existing.balance = wallet.balance.toJSON().amount;
      existing.version = wallet.version;
      existing.updatedAt = wallet.updatedAt;
    } else {
      const entity = manager.create(WalletEntity, {
        id: wallet.id,
        playerId: wallet.playerId,
        currency: wallet.currency,
        balance: wallet.balance.toJSON().amount,
        version: wallet.version,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      });
      manager.persist(entity);
    }
  }

  private toDomain(entity: WalletEntity): Wallet {
    return Wallet.rehydrate({
      id: entity.id,
      playerId: entity.playerId,
      currency: entity.currency,
      balance: entity.balance,
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}