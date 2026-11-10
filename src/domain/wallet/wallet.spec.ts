import { Money } from '../money/money';
import { Wallet } from './wallet';

const makeMoney = (amount: string) => Money.from({ amount, currency: 'BRL' });

describe('Wallet', () => {
  it('abre com saldo inicial', () => {
    const wallet = Wallet.open({
      id: 'w1',
      playerId: 'p1',
      initialBalance: makeMoney('100.00'),
    });
    expect(wallet.balance.toString()).toBe('100.00 BRL');
    expect(wallet.version).toBe(1);
  });

  it('debita e retorna ledger entry', () => {
    const wallet = Wallet.open({
      id: 'w1',
      playerId: 'p1',
      initialBalance: makeMoney('100.00'),
    });
    const entry = wallet.debit(makeMoney('25.00'));
    expect(wallet.balance.toString()).toBe('75.00 BRL');
    expect(entry.balanceBefore.toString()).toBe('100.00 BRL');
    expect(entry.balanceAfter.toString()).toBe('75.00 BRL');
    expect(wallet.version).toBe(2);
  });

  it('não permite saldo negativo', () => {
    const wallet = Wallet.open({
      id: 'w1',
      playerId: 'p1',
      initialBalance: makeMoney('10.00'),
    });
    expect(() => wallet.debit(makeMoney('50.00'))).toThrow('Insufficient balance');
  });

  it('credita corretamente', () => {
    const wallet = Wallet.open({
      id: 'w1',
      playerId: 'p1',
      initialBalance: makeMoney('100.00'),
    });
    wallet.credit(makeMoney('50.00'));
    expect(wallet.balance.toString()).toBe('150.00 BRL');
  });

  it('lança erro com moeda diferente', () => {
    const wallet = Wallet.open({
      id: 'w1',
      playerId: 'p1',
      initialBalance: makeMoney('100.00'),
    });
    const usd = Money.from({ amount: '10.00', currency: 'USD' });
    expect(() => wallet.debit(usd)).toThrow('Currency mismatch');
  });
});