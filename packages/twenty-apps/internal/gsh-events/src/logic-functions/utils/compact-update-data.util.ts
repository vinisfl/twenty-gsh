export const compactUpdateData = <T extends Record<string, unknown>>(
  data: T,
): Partial<T> =>
  Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
