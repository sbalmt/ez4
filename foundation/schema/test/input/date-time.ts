import type { String } from '@ez4/schema';

/**
 * Internal test description.
 *
 * @description String type enriched with date and time formats.
 */
export interface DateTimeTestSchema {
  /**
   * @description String following a date & time format.
   */
  dateTime: String.DateTime;

  /**
   * @description String following a time format.
   */
  time: String.Time;

  /**
   * @description String following a date format.
   */
  date: String.Date;
}
