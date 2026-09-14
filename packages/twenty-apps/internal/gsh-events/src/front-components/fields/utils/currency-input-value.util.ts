export const toCurrencyInputValue = (value: number | undefined): string =>
  value?.toString() ?? '';

export const fromCurrencyInputValue = (
  value: string,
): number | undefined => {
  if (value === '') {
    return undefined;
  }

  const numericValue = Number(value);

  return Number.isNaN(numericValue) ? undefined : numericValue;
};

const DEFAULT_CURRENCY_DECIMALS = 2;

export const getCurrencyInputScale = (
  value: number | undefined,
): number => {
  const decimalPart = toCurrencyInputValue(value).split('.')[1];

  return Math.max(DEFAULT_CURRENCY_DECIMALS, decimalPart?.length ?? 0);
};
