import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const stylesheet = readFileSync(
  new URL('./status-now-date-picker.css', import.meta.url),
  'utf8',
);

describe('reschedule calendar navigation', () => {
  it('keeps the next-month button at the right edge when the time picker is below the month', () => {
    expect(stylesheet).toMatch(
      /\.gsh-reschedule-calendar \.react-datepicker__navigation--next--with-time:not\(\.react-datepicker__navigation--next--with-today-button\)\s*\{\s*right: 2px;/,
    );
  });
});
