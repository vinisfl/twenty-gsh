import { describe, expect, it } from 'vitest';
import { toCurrency } from 'src/logic-functions/utils/to-currency.util';

describe('toCurrency', () => {
  it('converts reais to micros without losing cents', () => {
    expect(toCurrency(125.45)).toEqual({ amountMicros: 125_450_000, currencyCode: 'BRL' });
  });
});
