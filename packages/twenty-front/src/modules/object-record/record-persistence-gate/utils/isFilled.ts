import { isDefined } from 'twenty-shared/utils';

export const isFilled = (value: string | null | undefined): boolean =>
  isDefined(value) && value.trim().length > 0;
