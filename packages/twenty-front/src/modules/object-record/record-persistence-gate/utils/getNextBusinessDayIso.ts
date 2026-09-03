import { type Temporal } from 'temporal-polyfill';
import { isPlainDateInWeekend } from 'twenty-shared/utils';

export const getNextBusinessDayIso = ({
  fromPlainDate,
  timeZone,
}: {
  fromPlainDate: Temporal.PlainDate;
  timeZone: string;
}): string => {
  let nextBusinessDay = fromPlainDate.add({ days: 1 });

  while (isPlainDateInWeekend(nextBusinessDay)) {
    nextBusinessDay = nextBusinessDay.add({ days: 1 });
  }

  return nextBusinessDay.toZonedDateTime(timeZone).toInstant().toString();
};
