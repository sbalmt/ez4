/**
 * Based on the given type `T`, it returns `true` when `T` is `any`, otherwise returns `false`;
 */
export type IsAny<T> = boolean extends (T extends never ? true : false) ? true : false;

/**
 * Given the types `T` and `U`, it ensures an object satisfies only `T` or `U` without sharing
 * any property between them.
 */
export type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

/**
 * Given the types `T` and `U`, it produces a new object containing all properties from `T` and
 * ensures no properties from `U` are accepted.
 */
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
