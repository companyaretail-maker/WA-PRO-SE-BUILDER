/**
 * Washington legal holidays under RCW 1.16.050.
 *
 * Fixed-date holidays that land on a Saturday are observed the preceding Friday
 * and those landing on a Sunday the following Monday, per the same statute.
 * Both the nominal and the observed day are treated as non-judicial here, which
 * is the conservative direction for a filing deadline.
 */

function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month, 1 + offset + (n - 1) * 7);
}

function lastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  const last = new Date(year, month + 1, 0);
  const offset = (last.getDay() - weekday + 7) % 7;
  return new Date(year, month, last.getDate() - offset);
}

function key(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function observedVariants(d: Date): Date[] {
  if (d.getDay() === 6) return [d, new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1)];
  if (d.getDay() === 0) return [d, new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)];
  return [d];
}

const cache = new Map<number, Set<string>>();

export function waLegalHolidays(year: number): Set<string> {
  const cached = cache.get(year);
  if (cached) return cached;

  const thanksgiving = nthWeekdayOfMonth(year, 10, 4, 4); // 4th Thursday in November
  const dayAfterThanksgiving = new Date(year, 10, thanksgiving.getDate() + 1);

  const fixed = [
    new Date(year, 0, 1), // New Year's Day
    new Date(year, 5, 19), // Juneteenth
    new Date(year, 6, 4), // Independence Day
    new Date(year, 10, 11), // Veterans Day
    new Date(year, 11, 25), // Christmas Day
  ];

  const floating = [
    nthWeekdayOfMonth(year, 0, 1, 3), // MLK Jr. Day
    nthWeekdayOfMonth(year, 1, 1, 3), // Presidents' Day
    lastWeekdayOfMonth(year, 4, 1), // Memorial Day
    nthWeekdayOfMonth(year, 8, 1, 1), // Labor Day
    thanksgiving,
    dayAfterThanksgiving, // Native American Heritage Day
  ];

  const set = new Set<string>();
  for (const d of fixed) for (const v of observedVariants(d)) set.add(key(v));
  for (const d of floating) set.add(key(d));

  cache.set(year, set);
  return set;
}

export function isWaLegalHoliday(d: Date): boolean {
  return waLegalHolidays(d.getFullYear()).has(key(d));
}

/** Saturday, Sunday, or a legal holiday -- i.e. not a day the clerk's office is open. */
export function isNonJudicialDay(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6 || isWaLegalHoliday(d);
}
