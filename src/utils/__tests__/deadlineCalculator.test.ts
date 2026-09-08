import { describe, it, expect } from 'vitest';
import { countDays, parseLocalDate, calculateCR6Deadline } from '../deadlineCalculator';

const d = parseLocalDate;

describe('parseLocalDate', () => {
  it('parses as a local date, not UTC midnight', () => {
    // `new Date('2026-01-10')` is UTC midnight = Jan 9 in Pacific time. A filing
    // deadline that silently shifts a day is the bug this guards.
    const parsed = d('2026-01-10');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(0);
    expect(parsed.getDate()).toBe(10);
  });
});

describe('countDays', () => {
  it('does not count the day of the triggering act', () => {
    const r = countDays(d('2026-03-02'), 1, { mode: 'calendar', direction: 'forward' });
    expect(r.formatted).toContain('March 3, 2026');
  });

  it('counts calendar days including weekends', () => {
    // Mon Mar 2 + 7 calendar days = Mon Mar 9.
    const r = countDays(d('2026-03-02'), 7, { mode: 'calendar', direction: 'forward' });
    expect(r.formatted).toContain('March 9, 2026');
  });

  it('skips weekends when counting court days', () => {
    // Mon Mar 2 + 5 court days = Mon Mar 9 (Sat/Sun not counted).
    const r = countDays(d('2026-03-02'), 5, { mode: 'court', direction: 'forward' });
    expect(r.formatted).toContain('March 9, 2026');
  });

  it('skips legal holidays when counting court days', () => {
    // Wed Dec 2 back 6 court days must skip Thanksgiving (Nov 26) and the day
    // after (Nov 27) as well as both weekends.
    const r = countDays(d('2026-12-02'), 6, { mode: 'court', direction: 'backward' });
    expect(r.formatted).toContain('November 20, 2026');
    const skipped = r.steps.filter((s) => !s.counted).map((s) => s.date);
    expect(skipped).toContain('Thu, Nov 26, 2026');
    expect(skipped).toContain('Fri, Nov 27, 2026');
  });

  it('rolls a forward deadline off a weekend to the next judicial day', () => {
    // Thu Mar 5 + 2 calendar days = Sat Mar 7 -> Mon Mar 9.
    const r = countDays(d('2026-03-05'), 2, { mode: 'calendar', direction: 'forward' });
    expect(r.formatted).toContain('March 9, 2026');
    expect(r.rolledForward).toBe(true);
  });

  it('rolls a backward cutoff earlier, never later', () => {
    // Counting back must not land the user after the real cutoff.
    const r = countDays(d('2026-03-09'), 2, { mode: 'calendar', direction: 'backward' });
    expect(r.date.getTime()).toBeLessThan(d('2026-03-09').getTime());
    expect(r.formatted).toContain('March 6, 2026'); // Sat Mar 7 -> back to Fri
  });

  it('records one step per day walked', () => {
    const r = countDays(d('2026-03-02'), 3, { mode: 'calendar', direction: 'forward' });
    expect(r.steps).toHaveLength(3);
    expect(r.steps.every((s) => s.counted)).toBe(true);
  });

  it('returns the start date unchanged for a zero-day period', () => {
    const r = countDays(d('2026-03-04'), 0, { mode: 'court', direction: 'forward' });
    expect(r.formatted).toContain('March 4, 2026');
    expect(r.steps).toHaveLength(0);
  });
});

describe('calculateCR6Deadline', () => {
  it('keeps the original single-argument behaviour', () => {
    expect(calculateCR6Deadline(d('2026-03-02'), 7)).toContain('March 9, 2026');
  });
});
