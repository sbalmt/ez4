import type { IsObject, MergeObject } from '../object/generics';
import type { MergeArray } from '../array/generics';

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
 * Given a type `T`, it returns `true` when `T` is `unknown`, otherwise it returns `false`.
 */
export type IsUnknown<T> = unknown extends T ? (T extends unknown ? true : false) : false;

/**
 * Given a type `T`, it returns `true` when `T` can be `null` or `undefined`, and `false`
 * otherwise.
 */
export type IsOptional<T> = true extends IsNullable<T> | IsUndefined<T> ? true : false;

/**
 * Given the types `T` and `U`, it ensures the object satisfies only `T` or `U`.
 */
export type ExclusiveType<T, U> = T | U extends object ? (VoidType<T, U> & U) | (VoidType<U, T> & T) : T | U;

/**
 * Given the types `T` and `U`, it produces a new type containing all properties
 * from `T` and ensures that no properties from `U` are accepted.
 */
export type VoidType<T, U> = T | U extends object ? { [P in Exclude<keyof T, keyof U>]?: never } : T | U;

/**
 * Given the types `T` and `U`, it produces a new type merging both types.
 */
export type MergeType<T, U> =
  IsObject<T> extends true
    ? IsObject<U> extends true
      ? MergeObject<NonNullable<T>, NonNullable<U>>
      : NonNullable<U> extends unknown[]
        ? MergeArray<NonNullable<T>[], NonNullable<U>>
        : T | U
    : NonNullable<T> extends unknown[]
      ? NonNullable<U> extends unknown[]
        ? MergeArray<NonNullable<T>, NonNullable<U>>
        : MergeArray<NonNullable<T>, U[]>
      : NonNullable<U> extends unknown[]
        ? MergeArray<NonNullable<T>[], NonNullable<U>>
        : T | U;
