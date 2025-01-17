import type { ArrayType, IsAny, IsArray } from '../main.js';

/**
 * Represent any object.
 */
export type AnyObject = Record<any, any>;

/**
 * Given a type `T`, it returns `true` when `T` is an object, otherwise returns `false`.
 */
export type IsObject<T> =
  IsAny<T> extends true
    ? false
    : IsArray<T> extends true
      ? false
      : NonNullable<T> extends AnyObject
        ? true
        : false;

/**
 * Given a type `T`, it returns `true` when `T` is not an empty object, otherwise returns `false`.
 */
export type IsObjectEmpty<T extends AnyObject> =
  IsAny<T> extends true ? true : keyof T extends never ? true : false;

/**
 * Based on the given object type `T`, it produces a new object type allowing its original
 * type, `undefined` and `null` for all first-level properties.
 */
export type Incomplete<T> = {
  [P in keyof T]?: T[P] | null;
};

/**
 * Given an object type `T` and a property `P`, it returns `true` when the property exists,
 * otherwise returns `false`.
 */
export type PropertyExists<P, T extends AnyObject> = P extends keyof T ? true : false;

/**
 * Given an object type `T` and a property `P`, it returns the corresponding property type.
 */
export type PropertyType<P, T extends AnyObject> = P extends keyof T ? T[P] : never;

/**
 * Based on the given object type `T`, it produces a new object type having its nested
 * properties set to optional.
 */
export type DeepPartial<T extends AnyObject> = {
  [P in keyof T]?: IsArray<T[P]> extends false
    ? IsObject<T[P]> extends true
      ? DeepPartial<T[P]>
      : T[P]
    : T[P];
};

/**
 * Based on the given `T` object, it produces a new object type allowing only `boolean`
 * as its property values. This is used in conjunction with `PartialObject`.
 *
 * @example
 * type Foo = PartialProperties<{ bar: string, baz: number }>; // { bar: true, baz: true }
 */
export type PartialProperties<T extends AnyObject> = {
  [P in keyof T]?: IsArray<T[P]> extends false
    ? IsObject<T[P]> extends true
      ? PartialProperties<NonNullable<T[P]>> | boolean
      : boolean
    : ArrayType<T[P]> extends AnyObject
      ? PartialProperties<ArrayType<T[P]>> | boolean
      : boolean;
};

/**
 * Based on the given `T` and `O` objects, it produces a new object type containing only
 * properties that are in `O` if `V` is `true` or omit them if `V` is `false`, the property
 * type follows the same as in `T`. This is used in conjunction with `PartialProperties`.
 * 
 @example
 type Foo = PartialObject<{ bar: string, baz: number }, { bar: true }>; // { bar: string }
 */
export type PartialObject<T extends AnyObject, O extends AnyObject, V extends boolean = true> = {
  [P in keyof T as PartialObjectProperty<O[P], P, V>]: IsArray<T[P]> extends false
    ? IsObject<O[P]> extends true
      ? PartialObject<T[P], O[P], V>
      : T[P]
    : IsObject<O[P]> extends true
      ? ArrayType<T[P]> extends AnyObject
        ? PartialObject<ArrayType<T[P]>, O[P], V>[]
        : T[P]
      : T[P];
};

/**
 * Based on the given `T` object, it produces a new object that doesn't contain nested
 * array types.
 */
export type FlatObject<T extends AnyObject> = {
  [P in keyof T]: IsArray<T[P]> extends false
    ? IsObject<T[P]> extends true
      ? FlatObject<T[P]>
      : T[P]
    : ArrayType<T[P]> extends AnyObject
      ? FlatObject<ArrayType<T[P]>>
      : ArrayType<T[P]>;
};

/**
 * Helper type to determine if a property exists or not in a `PartialObject`.
 *
 * - When the given `T` is `true` or an object, it returns `K` if `V` is also true.
 * - When the given `T` is `false` or not an object, it returns `K` if `V` is also false.
 * - In any other case, it returns `never`.
 */
type PartialObjectProperty<T, K, V> = T extends true | AnyObject
  ? V extends true
    ? never
    : K
  : V extends false
    ? never
    : K;
