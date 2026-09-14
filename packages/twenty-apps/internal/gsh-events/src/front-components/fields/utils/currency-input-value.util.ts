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
