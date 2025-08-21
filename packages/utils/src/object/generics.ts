import type { ArrayType, IsArray } from '../array/generics.js';
import type { IsAny } from '../common/generics.js';

/**
 * A type to represent any object.
 */
export type AnyObject = Record<any, any>;

/**
 * Given an object type `T`, it returns `true` when `T` is an empty object, otherwise returns `false`.
 */
export type IsObjectEmpty<T extends AnyObject> =
  IsAny<T> extends true ? true : keyof T extends never ? true : string extends keyof T ? true : false;

/**
 * Given an object type `T`, it returns `true` when `T` is an object, otherwise returns `false`.
 */
export type IsObject<T> =
  IsAny<T> extends true
    ? false
    : IsArray<T> extends true
      ? false
      : NonNullable<T> extends AnyObject
        ? NonNullable<T> extends Array<any> | Function | RegExp | Date | Error | Map<any, any> | Set<any>
          ? false
          : true
        : false;

/**
 * Given an object type `T`, it produces a new object type allowing its original type, `undefined`
 * and `null` for all first-level properties.
 */
export type Incomplete<T extends AnyObject> = { [P in keyof T]?: T[P] | null };

/**
 * Given a complex object type `T`, it produces a new object type resolving its all first-level
 * property names.
 */
export type Prettify<T extends AnyObject> = { [K in keyof T]: T[K] } & unknown;

/**
 * Given a type `T` and a property `P`, it returns `true` when the property exists,
 * otherwise returns `false`.
 */
export type PropertyExists<P, T extends AnyObject> = P extends keyof T ? true : false;

/**
 * Given a type `T` and a property `P`, it returns the corresponding property type.
 */
export type PropertyType<P, T extends AnyObject> = P extends keyof T ? T[P] : never;

/**
 * Given a type `T`, it produces a new `T` type that doesn't contain array types.
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
 * Given a type `T`, it produces a new `T` type having all properties set to optional.
 */
export type OptionalObject<T extends AnyObject> = {
  [P in keyof T]?: IsArray<T[P]> extends false ? (IsObject<T[P]> extends true ? OptionalObject<T[P]> : T[P]) : T[P];
};

/**
 * Given the types `T` and `U`, it produces a new `T` type ensuring only properties in
 * common with `U` type.
 */
export type StrictObject<T, U extends AnyObject> =
  IsObjectEmpty<U> extends true
    ? T
    : IsObject<T> extends true
      ? { [P in keyof T]: P extends keyof U ? StrictObject<T[P], NonNullable<U[P]>> : never }
      : T;

/**
 * Given a type `T`, it produces a new type allowing only `boolean` as its property values.
 * This is used in conjunction with `PartialObject`.
 *
 * @example
 * type Foo = PartialProperties<{ bar: string, baz: number }>; // { bar: boolean, baz: boolean }
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
 * Given the object types `T` and `O`, it produces a new type containing only properties that
 * are in `O` if `V` is `true` or omit them if `V` is `false`, the original property type is
 * preserved. This is used in conjunction with `PartialProperties`.
 * 
 @example
 type Foo = PartialObject<{ bar: string, baz: number }, { bar: true }>; // { bar: string }
 */
export type PartialObject<T extends AnyObject, O extends AnyObject, V extends boolean = true> = Prettify<{
  [P in keyof T as PartialObjectProperty<O[P], P, V>]: IsArray<T[P]> extends false
    ? IsObject<O[P]> extends true
      ? PartialObject<T[P], O[P], V>
      : T[P]
    : IsObject<O[P]> extends true
      ? ArrayType<T[P]> extends AnyObject
        ? PartialObject<ArrayType<T[P]>, O[P], V>[]
        : T[P]
      : T[P];
}>;

/**
 * Helper type to determine if a property exists or not in a `PartialObject`.
 *
 * - When the given `T` is `true` or an object, it returns `K` if `V` is also true.
 * - When the given `T` is `false` or not an object, it returns `K` if `V` is also false.
 * - In any other case, it returns `never`.
 */
type PartialObjectProperty<T, K, V> = T extends AnyObject ? K : T extends true ? (V extends true ? K : never) : V extends true ? never : K;

/**
 * Given a type `T`, is produces a union containing all inner types.
 */
export type InnerTypes<T> = IsObject<T> extends true ? InnerTypes<T[keyof T]> : T;
