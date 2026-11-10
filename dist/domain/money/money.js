"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
class Money {
    value;
    currency;
    constructor(value, currency) {
        this.value = value;
        this.currency = currency;
    }
    static from(props) {
        const d = new decimal_js_1.default(props.amount);
        if (d.isNaN() || !d.isFinite()) {
            throw new Error('Invalid amount');
        }
        if (d.isNegative()) {
            throw new Error('Amount cannot be negative');
        }
        if (d.decimalPlaces() > 2) {
            throw new Error('Amount cannot have more than 2 decimal places');
        }
        return new Money(d, props.currency);
    }
    static zero(currency) {
        return new Money(new decimal_js_1.default('0.00'), currency);
    }
    add(other) {
        this.assertSameCurrency(other);
        return new Money(this.value.plus(other.value), this.currency);
    }
    subtract(other) {
        this.assertSameCurrency(other);
        return new Money(this.value.minus(other.value), this.currency);
    }
    negate() {
        return new Money(this.value.negated(), this.currency);
    }
    isZero() { return this.value.isZero(); }
    isPositive() { return this.value.isPositive() && !this.value.isZero(); }
    isNegative() { return this.value.isNegative(); }
    isLessThan(other) {
        this.assertSameCurrency(other);
        return this.value.lessThan(other.value);
    }
    equals(other) {
        return this.currency === other.currency && this.value.equals(other.value);
    }
    toJSON() {
        return { amount: this.value.toFixed(2), currency: this.currency };
    }
    toString() {
        return `${this.value.toFixed(2)} ${this.currency}`;
    }
    assertSameCurrency(other) {
        if (this.currency !== other.currency) {
            throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
        }
    }
}
exports.Money = Money;
//# sourceMappingURL=money.js.map