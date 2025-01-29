import type { IsAny } from '../main.js';

/**
 * Given a type `T`, it returns `true` when `T` is an array, otherwise returns `false`.
 */
export type IsArray<T> =
  IsAny<T> extends true ? false : NonNullable<T> extends [...unknown[]] ? true : false;

/**
 * Given the array type `T`, it returns `true` when `T` is empty or `any`, otherwise
 * returns `false`.
 */
export type IsArrayEmpty<T extends unknown[]> =
  IsAny<T> extends true ? true : T extends [unknown, ...unknown[]] ? false : true;

/**
 * Given the array type `T`, it returns another array skipping the first element.
 */
export type ArrayRest<T extends unknown[]> =
  IsAny<T> extends true ? [] : T extends [unknown, ...infer Rest] ? Rest : [];

/**
 * Given the array type `T`, it returns the array element type.
 */
export type ArrayType<T extends unknown[]> =
  IsAny<T> extends true ? never : T extends (infer U)[] ? NonNullable<U> : never;
