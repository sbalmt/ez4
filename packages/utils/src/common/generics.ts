import { IsObject } from '../object/generics.js';

/**
 * Given a type `T`, it returns `true` when `T` is `any`, otherwise it returns `false`;
 */
export type IsAny<T> = boolean extends (T extends never ? true : false) ? true : false;

/**
 * Given a type `T`, it returns `true` when `T` can be `null`, otherwise it returns `false`.
 */
export type IsNullable<T> = null extends T ? true : false;

/**
 * Given a type `T`, it returns `true` when `T` can be `undefined`, and `false` otherwise.
 */
export type IsUndefined<T> = undefined extends T ? true : false;

/**
 * Given a type `T`, it returns `true` when `T` can be `null` or `undefined`, and `false`
 * otherwise.
 */
export type IsOptional<T> = true extends IsNullable<T> | IsUndefined<T> ? true : false;

/**
 * Given the types `T` and `U`, it ensures type `U` will have only properties in common
 * with `T` type.
 */
export type StrictType<T, U extends T> = {
  [K in keyof T]: IsObject<U[K]> extends true ? StrictType<T[K], U[K]> : U[K];
} & {
  [K in Exclude<keyof U, keyof T>]: never;
};

/**
 * Given the types `T` and `U`, it ensures an object satisfies only `T` or `U` without
 * sharing any property between them.
 */
export type ExclusiveType<T, U> = T | U extends object
  ? (VoidType<T, U> & U) | (VoidType<U, T> & T)
  : T | U;

/**
 * Given the types `T` and `U`, it produces a new type containing all properties
 * from `T` and ensures that no properties from `U` are accepted.
 */
export type VoidType<T, U> = T | U extends object
  ? { [P in Exclude<keyof T, keyof U>]?: never }
  : T | U;
