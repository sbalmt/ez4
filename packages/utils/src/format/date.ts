const datePattern = '([0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])';
const timePattern = '(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])';

const tzPattern = '(Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])';
const msPattern = '(\\.[0-9]+)';

const onlyDateRegEx = new RegExp(`^${datePattern}$`);
const onlyTimeRegEx = new RegExp(`^${timePattern}$`);
const dateTimeRegEx = new RegExp(`^${datePattern}T${timePattern}${msPattern}?${tzPattern}?$`);

/**
 * Determines whether the given value is a valid ISO 8601 date format
 * and produces a valid date.
 *
 * @param value Value to check.
 * @returns Returns `true` for a valid date, `false` otherwise.
 */
export const isDate = (value: string) => {
  const date = onlyDateRegEx.exec(value);

  if (date) {
    const [, year, month, day] = date;

    return ensureValidDate(parseInt(year), parseInt(month), parseInt(day));
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
  return onlyTimeRegEx.test(value);
};

/**
 * Determines whether the given value is a valid ISO 8601 date-time format
 * and produces a valid date-time.
 *
 * @param value Value to check.
 * @returns Returns `true` for a valid date-time, `false` otherwise.
 */
export const isDateTime = (value: string) => {
  const date = dateTimeRegEx.exec(value);

  if (date) {
    const [, year, month, day] = date;

    return ensureValidDate(parseInt(year), parseInt(month), parseInt(day));
  }

  return false;
};

/**
 * Ensure the given `year`, `month` and `date` is valid.
 */
const ensureValidDate = (year: number, month: number, day: number) => {
  return new Date(year, month - 1, day).getDate() === day;
};
