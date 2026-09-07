import { addDays, isWeekend, format } from 'date-fns';

export function calculateCR6Deadline(startDate: Date, daysToAdd: number): string {
  // CR 6 Calculation Logic
  let currentDate = startDate;
  let addedDays = 0;

  while (addedDays < daysToAdd) {
    currentDate = addDays(currentDate, 1);
    
    // CR 6(a): If period is < 7 days, intermediate Saturdays, Sundays, and legal holidays are excluded.
    // For this prototype, we exclude weekends.
    if (daysToAdd < 7) {
      if (!isWeekend(currentDate)) {
        addedDays++;
      }
    } else {
      addedDays++;
    }
  }

  // The final day cannot fall on a weekend or holiday
  while (isWeekend(currentDate)) {
    currentDate = addDays(currentDate, 1);
  }

  return format(currentDate, 'EEEE, MMMM d, yyyy');
}
