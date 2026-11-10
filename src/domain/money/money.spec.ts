import { Money } from './money';

describe('Money', () => {
  describe('from', () => {
    it('cria com valor válido', () => {
      const m = Money.from({ amount: '25.00', currency: 'BRL' });
      expect(m.toString()).toBe('25.00 BRL');
    });

    it('rejeita valor negativo', () => {
      expect(() => Money.from({ amount: '-1.00', currency: 'BRL' })).toThrow();
    });

    it('rejeita mais de 2 casas decimais', () => {
      expect(() => Money.from({ amount: '1.001', currency: 'BRL' })).toThrow();
    });
  });

  describe('add', () => {
    it('soma corretamente', () => {
      const a = Money.from({ amount: '0.10', currency: 'BRL' });
      const b = Money.from({ amount: '0.20', currency: 'BRL' });
      expect(a.add(b).toString()).toBe('0.30 BRL');
    });

    it('lança erro com moedas diferentes', () => {
      const a = Money.from({ amount: '10.00', currency: 'BRL' });
      const b = Money.from({ amount: '10.00', currency: 'USD' });
      expect(() => a.add(b)).toThrow();
    });
  });
});