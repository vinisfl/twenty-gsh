import { Temporal } from 'temporal-polyfill';

import { getNextBusinessDayIso } from '@/object-record/record-persistence-gate/utils/getNextBusinessDayIso';

const TIME_ZONE = 'America/Sao_Paulo';

const weekdayOf = (iso: string): number =>
  Temporal.Instant.from(iso).toZonedDateTimeISO(TIME_ZONE).dayOfWeek;

describe('getNextBusinessDayIso', () => {
  it('should return Monday when starting from a Friday', () => {
    const friday = Temporal.PlainDate.from('2026-09-04');

    const result = getNextBusinessDayIso({
      fromPlainDate: friday,
      timeZone: TIME_ZONE,
    });

    expect(weekdayOf(result)).toBe(1);
    expect(
      Temporal.Instant.from(result)
        .toZonedDateTimeISO(TIME_ZONE)
        .toPlainDate()
        .toString(),
    ).toBe('2026-09-07');
  });

  it('should return Thursday when starting from a Wednesday', () => {
    const wednesday = Temporal.PlainDate.from('2026-09-02');

    const result = getNextBusinessDayIso({
      fromPlainDate: wednesday,
      timeZone: TIME_ZONE,
    });

    expect(weekdayOf(result)).toBe(4);
    expect(
      Temporal.Instant.from(result)
        .toZonedDateTimeISO(TIME_ZONE)
        .toPlainDate()
        .toString(),
    ).toBe('2026-09-03');
  });

  it('should return Monday when starting from a Saturday', () => {
    const saturday = Temporal.PlainDate.from('2026-09-05');

    const result = getNextBusinessDayIso({
      fromPlainDate: saturday,
      timeZone: TIME_ZONE,
    });

    expect(weekdayOf(result)).toBe(1);
    expect(
      Temporal.Instant.from(result)
        .toZonedDateTimeISO(TIME_ZONE)
        .toPlainDate()
        .toString(),
    ).toBe('2026-09-07');
  });

  it('should return Monday when starting from a Sunday', () => {
    const sunday = Temporal.PlainDate.from('2026-09-06');

    const result = getNextBusinessDayIso({
      fromPlainDate: sunday,
      timeZone: TIME_ZONE,
    });

    expect(weekdayOf(result)).toBe(1);
    expect(
      Temporal.Instant.from(result)
        .toZonedDateTimeISO(TIME_ZONE)
        .toPlainDate()
        .toString(),
    ).toBe('2026-09-07');
  });
});
