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
export declare class Wallet {
    readonly id: string;
    readonly playerId: string;
    readonly currency: string;
    private _balance;
    private _version;
    readonly createdAt: Date;
    private _updatedAt;
    private constructor();
    static open(props: {
        id: string;
        playerId: string;
        initialBalance: Money;
    }): Wallet;
    static rehydrate(state: WalletState): Wallet;
    get balance(): Money;
    get version(): number;
    get updatedAt(): Date;
    debit(amount: Money): LedgerEntry;
    credit(amount: Money): LedgerEntry;
    private assertSameCurrency;
}
export {};
