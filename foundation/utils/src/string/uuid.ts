const UUID_REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-[1-9][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

/**
 * Determines whether or not the given value is a valid UUID.
 *
 * @param value Value to check.
 * @returns Returns true for a valid UUID, false otherwise.
 */
export const isUUID = (value: string) => {
  return UUID_REGEX.test(value);
};
