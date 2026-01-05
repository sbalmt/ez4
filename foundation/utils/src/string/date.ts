const DATE_PATTERN = '([0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])';
const TIME_PATTERN = '(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])';

const TZ_PATTERN = '(Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])';
const MS_PATTERN = '(\\.[0-9]+)';

const DATE_TIME_REGEX = new RegExp(`^${DATE_PATTERN}T${TIME_PATTERN}${MS_PATTERN}?${TZ_PATTERN}?$`);
const ONLY_TIME_REGEX = new RegExp(`^${TIME_PATTERN}${MS_PATTERN}?${TZ_PATTERN}?$`);
const ONLY_DATE_REGEX = new RegExp(`^${DATE_PATTERN}$`);

/**
 * Determines whether the given value is a valid ISO 8601 date format
 * and produces a valid date.
 *
 * @param value Value to check.
 * @returns Returns `true` for a valid date, `false` otherwise.
 */
export const isDate = (value: string) => {
  const date = ONLY_DATE_REGEX.exec(value);

  if (date) {
    const [, rawYear, rawMonth, rawDay] = date;

    const year = parseInt(rawYear);
    const month = parseInt(rawMonth);
    const day = parseInt(rawDay);

    return ensureValidDate(year, month, day);
  }

  return false;
};

/**
 * Determines whether the given value is a valid ISO 8601 time format
 * and produces a valid time.
 *
 * @param value Value to check.
 * @returns Returns `true` for a valid time, `false` otherwise.
 */
export const isTime = (value: string) => {
  return ONLY_TIME_REGEX.test(value);
};

/**
 * Determines whether the given value is a valid ISO 8601 date-time format
 * and produces a valid date-time.
 *
 * @param value Value to check.
 * @returns Returns `true` for a valid date-time, `false` otherwise.
 */
export const isDateTime = (value: string) => {
  const date = DATE_TIME_REGEX.exec(value);

  if (date) {
    const [, rawYear, rawMonth, rawDay] = date;

    const year = parseInt(rawYear);
    const month = parseInt(rawMonth);
    const day = parseInt(rawDay);

    return ensureValidDate(year, month, day);
  }

  return false;
};

/**
 * Ensure the given `year`, `month` and `date` is valid.
 */
const ensureValidDate = (year: number, month: number, day: number) => {
  return new Date(year, month - 1, day).getDate() === day;
};
