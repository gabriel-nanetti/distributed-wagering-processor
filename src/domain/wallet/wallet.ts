import { Money } from '../money/money';

interface WalletState {
  id: string;
  playerId: string;
  currency: string;
  balance: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LedgerEntry {
  direction: 'DEBIT' | 'CREDIT';
  amount: Money;
  balanceBefore: Money;
  balanceAfter: Money;
}

export class Wallet {
  private constructor(
    public readonly id: string,
    public readonly playerId: string,
    public readonly currency: string,
    private _balance: Money,
    private _version: number,
    public readonly createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static open(props: {
    id: string;
    playerId: string;
    initialBalance: Money;
  }): Wallet {
    return new Wallet(
      props.id,
      props.playerId,
      props.initialBalance.currency,
      props.initialBalance,
      1,
      new Date(),
      new Date(),
    );
  }

  static rehydrate(state: WalletState): Wallet {
    return new Wallet(
      state.id,
      state.playerId,
      state.currency,
      Money.from({ amount: state.balance, currency: state.currency }),
      state.version,
      state.createdAt,
      state.updatedAt,
    );
  }

  get balance(): Money { return this._balance; }
  get version(): number { return this._version; }
  get updatedAt(): Date { return this._updatedAt; }

  debit(amount: Money): LedgerEntry {
    this.assertSameCurrency(amount);

    if (this._balance.isLessThan(amount)) {
      throw new Error('Insufficient balance');
    }

    const balanceBefore = this._balance;
    this._balance = this._balance.subtract(amount);
    this._version += 1;
    this._updatedAt = new Date();

    return {
      direction: 'DEBIT',
      amount,
      balanceBefore,
      balanceAfter: this._balance,
    };
  }

  credit(amount: Money): LedgerEntry {
    this.assertSameCurrency(amount);

    const balanceBefore = this._balance;
    this._balance = this._balance.add(amount);
    this._version += 1;
    this._updatedAt = new Date();

    return {
      direction: 'CREDIT',
      amount,
      balanceBefore,
      balanceAfter: this._balance,
    };
  }

  private assertSameCurrency(money: Money): void {
    if (this._balance.currency !== money.currency) {
      throw new Error(`Currency mismatch: ${this._balance.currency} vs ${money.currency}`);
    }
  }
}