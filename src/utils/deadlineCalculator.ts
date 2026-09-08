import { addDays, format } from 'date-fns';
import { isNonJudicialDay } from './waHolidays';

export type CountingMode = 'calendar' | 'court';
export type Direction = 'forward' | 'backward';

export interface DeadlineResult {
  date: Date;
  formatted: string;
  /** Every day walked, so the user can show the court how the count was made. */
  steps: { date: string; counted: boolean; reason: string }[];
  rolledForward: boolean;
  notes: string[];
}

/**
 * Parses a yyyy-MM-dd value from a date input as a LOCAL date.
 * `new Date('2026-01-10')` parses as UTC midnight, which is the previous day in
 * Pacific time -- an off-by-one that matters when the answer is a filing cutoff.
 */
export function parseLocalDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/**
 * Counts a procedural period.
 *
 * `calendar` counts every intervening day; `court` skips Saturdays, Sundays and
 * RCW 1.16.050 legal holidays as it counts. Under either mode the day of the
 * triggering act is not counted, and a period that would end on a non-judicial
 * day rolls to the next judicial day when counting forward, or back to the
 * previous judicial day when counting backward from a hearing date.
 *
 * IMPORTANT: which mode applies to a given deadline is a question of the rule
 * that sets it (CR 6(a) and its "less than 7 days" clause, plus any local rule).
 * This function does not decide that for you -- it executes the count you choose.
 */
export function countDays(
  start: Date,
  days: number,
  opts: { mode: CountingMode; direction: Direction },
): DeadlineResult {
  const { mode, direction } = opts;
  const step = direction === 'forward' ? 1 : -1;
  const steps: DeadlineResult['steps'] = [];
  const notes: string[] = [];

  let current = start;
  let counted = 0;

  while (counted < days) {
    current = addDays(current, step);
    const skip = mode === 'court' && isNonJudicialDay(current);
    if (!skip) counted++;
    steps.push({
      date: format(current, 'EEE, MMM d, yyyy'),
      counted: !skip,
      reason: skip ? 'Weekend or RCW 1.16.050 legal holiday - not counted' : `Day ${counted}`,
    });
  }

  let rolledForward = false;
  while (isNonJudicialDay(current)) {
    current = addDays(current, step);
    rolledForward = true;
  }
  if (rolledForward) {
    notes.push(
      direction === 'forward'
        ? 'The computed last day fell on a weekend or legal holiday, so it moved to the next judicial day.'
        : 'The computed cutoff fell on a weekend or legal holiday, so it moved earlier to the previous judicial day.',
    );
  }
  if (mode === 'calendar') {
    notes.push('Counted every calendar day. Confirm against the rule that sets this deadline before relying on it.');
  }

  return {
    date: current,
    formatted: format(current, 'EEEE, MMMM d, yyyy'),
    steps,
    rolledForward,
    notes,
  };
}

/** Backwards-compatible wrapper for the original single-purpose helper. */
export function calculateCR6Deadline(startDate: Date, daysToAdd: number): string {
  return countDays(startDate, daysToAdd, {
    mode: daysToAdd < 7 ? 'court' : 'calendar',
    direction: 'forward',
  }).formatted;
}
