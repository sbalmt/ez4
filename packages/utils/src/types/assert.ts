/**
 * Given the types `T` and `U`, it asserts whether both types are the same and
 * returns `true`; otherwise, it returns `false`
 */
export type AssertType<T, U> = U extends T ? (T extends U ? true : false) : false;

/**
 * Asserts the given types and uses the `valid` parameter to control the validity
 * of the assertion.
 *
 * @param valid Specify the expected value for a valid assertion.
 */
export const assertType = <T, U>(valid: AssertType<T, U>) => valid;
