import { describe, it, expect } from 'vitest';
import { isWaLegalHoliday, isNonJudicialDay } from '../waHolidays';
import { parseLocalDate } from '../deadlineCalculator';

const d = parseLocalDate;

describe('RCW 1.16.050 holidays', () => {
  it('recognises the fixed-date holidays', () => {
    expect(isWaLegalHoliday(d('2026-01-01'))).toBe(true); // New Year's Day
    expect(isWaLegalHoliday(d('2026-06-19'))).toBe(true); // Juneteenth
    expect(isWaLegalHoliday(d('2026-07-04'))).toBe(true); // Independence Day
    expect(isWaLegalHoliday(d('2026-11-11'))).toBe(true); // Veterans Day
    expect(isWaLegalHoliday(d('2026-12-25'))).toBe(true); // Christmas
  });

  it('recognises the floating holidays', () => {
    expect(isWaLegalHoliday(d('2026-01-19'))).toBe(true); // MLK, 3rd Mon Jan
    expect(isWaLegalHoliday(d('2026-02-16'))).toBe(true); // Presidents', 3rd Mon Feb
    expect(isWaLegalHoliday(d('2026-05-25'))).toBe(true); // Memorial, last Mon May
    expect(isWaLegalHoliday(d('2026-09-07'))).toBe(true); // Labor, 1st Mon Sep
    expect(isWaLegalHoliday(d('2026-11-26'))).toBe(true); // Thanksgiving, 4th Thu Nov
  });

  it('treats the day after Thanksgiving as a legal holiday', () => {
    expect(isWaLegalHoliday(d('2026-11-27'))).toBe(true);
    expect(isWaLegalHoliday(d('2025-11-28'))).toBe(true);
  });

  it('observes a Saturday holiday on the preceding Friday', () => {
    // July 4, 2026 falls on a Saturday.
    expect(d('2026-07-04').getDay()).toBe(6);
    expect(isWaLegalHoliday(d('2026-07-03'))).toBe(true);
  });

  it('observes a Sunday holiday on the following Monday', () => {
    // Nov 11, 2029 falls on a Sunday.
    expect(d('2029-11-11').getDay()).toBe(0);
    expect(isWaLegalHoliday(d('2029-11-12'))).toBe(true);
  });

  it('does not flag ordinary weekdays', () => {
    expect(isWaLegalHoliday(d('2026-03-17'))).toBe(false);
    expect(isNonJudicialDay(d('2026-03-17'))).toBe(false);
  });

  it('treats weekends as non-judicial', () => {
    expect(isNonJudicialDay(d('2026-03-21'))).toBe(true); // Saturday
    expect(isNonJudicialDay(d('2026-03-22'))).toBe(true); // Sunday
  });
});
