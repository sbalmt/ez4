import type { String } from '@ez4/schema';

/**
 * String type enriched with date and time formats.
 */
export interface DateTimeTestSchema {
  /**
   * String following a date & time format.
   */
  dateTime: String.DateTime;

  /**
   * String following a time format.
   */
  time: String.Time;

  /**
   * String following a date format.
   */
  date: String.Date;
}
