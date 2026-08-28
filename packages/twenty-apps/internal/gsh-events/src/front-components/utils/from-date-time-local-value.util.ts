export const fromDateTimeLocalValue = (value: string): string | undefined =>
  value === '' ? undefined : new Date(value).toISOString();
