export const toCurrency = (amount: number | undefined) =>
  amount === undefined
    ? undefined
    : { amountMicros: Math.round(amount * 1_000_000), currencyCode: 'BRL' };
