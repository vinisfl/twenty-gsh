export const fromDateTimeLocalInputValue = (value: string): string | null =>
  value === '' ? null : new Date(value).toISOString();
