const EMAIL_REGEX = /^[\w\+\-\.]+@([\w-]+\.)+[\w-]{2,}$/;

/**
 * Determines whether or not the given value is a valid email format.
 *
 * @param value Value to check.
 * @returns Returns true for a valid email, false otherwise.
 */
export const isEmail = (value: string) => {
  return EMAIL_REGEX.test(value);
};
