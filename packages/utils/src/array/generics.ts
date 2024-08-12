import type { IsAny } from '../main.js';

/**
 * Based on the given array type `T`, it return `true` when `T` is empty or `any`,
 * otherwise returns `false`.
 */
export type IsArrayEmpty<T extends unknown[]> =
  IsAny<T> extends true ? true : T extends [unknown, ...unknown[]] ? false : true;

/**
 * Based on the given array type `T`, it returns another array skipping the first
 * element.
 */
export type ArrayRest<T extends unknown[]> =
  IsAny<T> extends true ? [] : T extends [unknown, ...infer Rest] ? Rest : [];
