import { type MonetaryAmountDraft } from '@/object-record/record-persistence-gate/types/MonetaryAmountDraft';
import { isFilled } from '@/object-record/record-persistence-gate/utils/isFilled';

// Converts a currency-in-reais form-input string into the amountMicros shape
// the persisted record uses, or null when the input isn't a usable amount.
export const toMonetaryAmountDraft = (
  rawValue: string,
): MonetaryAmountDraft | null => {
  const parsedValue = Number(rawValue);

  return isFilled(rawValue) && Number.isFinite(parsedValue)
    ? { amountMicros: Math.round(parsedValue * 1_000_000) }
    : null;
};
