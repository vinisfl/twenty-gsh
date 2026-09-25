import { toMonetaryAmountDraft } from '@/object-record/record-persistence-gate/utils/toMonetaryAmountDraft';

describe('toMonetaryAmountDraft', () => {
  it('converts a reais amount string into amountMicros', () => {
    expect(toMonetaryAmountDraft('15000')).toEqual({
      amountMicros: 15_000_000_000,
    });
  });

  it('returns null for an empty value', () => {
    expect(toMonetaryAmountDraft('')).toBeNull();
  });

  it('returns null for a non-numeric value', () => {
    expect(toMonetaryAmountDraft('abc')).toBeNull();
  });
});
