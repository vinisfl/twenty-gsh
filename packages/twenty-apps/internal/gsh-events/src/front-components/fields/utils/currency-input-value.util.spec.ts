import { describe, expect, it } from 'vitest';

import {
  fromCurrencyInputValue,
  getCurrencyInputScale,
  toCurrencyInputValue,
} from 'src/front-components/fields/utils/currency-input-value.util';

describe('currency input value helpers', () => {
  it('keeps an empty monetary value empty', () => {
    expect(toCurrencyInputValue(undefined)).toBe('');
    expect(fromCurrencyInputValue('')).toBeUndefined();
  });

  it('converts between the form number and the unmasked currency draft', () => {
    expect(toCurrencyInputValue(12_500.5)).toBe('12500.5');
    expect(fromCurrencyInputValue('12500.5')).toBe(12_500.5);
    expect(fromCurrencyInputValue('-50')).toBe(-50);
  });

  it('does not turn an invalid masked draft into a saved number', () => {
    expect(fromCurrencyInputValue('not-a-number')).toBeUndefined();
  });

  it('preserves a saved value with more than two decimal places', () => {
    expect(getCurrencyInputScale(12_500.567)).toBe(3);
    expect(getCurrencyInputScale(12_500.5)).toBe(2);
  });
});
