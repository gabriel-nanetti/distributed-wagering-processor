"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const money_1 = require("../money/money");
class Wallet {
    id;
    playerId;
    currency;
    _balance;
    _version;
    createdAt;
    _updatedAt;
    constructor(id, playerId, currency, _balance, _version, createdAt, _updatedAt) {
        this.id = id;
        this.playerId = playerId;
        this.currency = currency;
        this._balance = _balance;
        this._version = _version;
        this.createdAt = createdAt;
        this._updatedAt = _updatedAt;
    }
    static open(props) {
        return new Wallet(props.id, props.playerId, props.initialBalance.currency, props.initialBalance, 1, new Date(), new Date());
    }
    static rehydrate(state) {
        return new Wallet(state.id, state.playerId, state.currency, money_1.Money.from({ amount: state.balance, currency: state.currency }), state.version, state.createdAt, state.updatedAt);
    }
    get balance() { return this._balance; }
    get version() { return this._version; }
    get updatedAt() { return this._updatedAt; }
    debit(amount) {
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
    credit(amount) {
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
    assertSameCurrency(money) {
        if (this._balance.currency !== money.currency) {
            throw new Error(`Currency mismatch: ${this._balance.currency} vs ${money.currency}`);
        }
    }
}
exports.Wallet = Wallet;
//# sourceMappingURL=wallet.js.map