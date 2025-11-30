import type { IsAny, IsNever, IsUndefined, MergeType } from '../common/generics';
import type { ArrayType, IsArray } from '../array/generics';

/**
 * A type to represent any object.
 */
export type AnyObject = Record<any, any>;

/**
 * Given a complex object type `T`, it produces a new object type resolving all its first-level
 * property names.
 */
export type Prettify<T extends AnyObject> = { [P in keyof T]: T[P] } & unknown;

/**
 * Given an object type `T`, it produces a new object type allowing its original type, `undefined`
 * and `null` for all first-level properties.
 */
export type Incomplete<T extends AnyObject> = { [P in keyof T]?: T[P] | undefined | null };

/**
 * Given an object type `T`, it produces a new object type allowing its original type only for
 * all first-level properties.
 */
export type Complete<T extends AnyObject> = { [P in keyof T]-?: Exclude<T[P], undefined | null> };

/**
 * Given a type `T` and a property `P`, it returns `true` when the property exists,
 * otherwise returns `false`.
 */
export type PropertyExists<P, T extends AnyObject> =
  IsAny<T> extends true ? false : IsNever<T> extends true ? false : P extends keyof T ? true : false;

/**
 * Given a type `T` and a property `P`, it returns the corresponding property type.
 */
export type PropertyType<P, T extends AnyObject> = P extends keyof T ? T[P] : never;

/**
 * Given an object type `T`, it returns `true` when `T` is an empty object, otherwise returns `false`.
 */
export type IsObjectEmpty<T extends AnyObject> =
  IsAny<T> extends true ? true : IsNever<keyof T> extends true ? true : string extends keyof T ? true : false;

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
 * Given a type `T`, it produces a new `T` type having all properties set to optional.
 */
export type OptionalObject<T extends AnyObject> = {
  [P in keyof T]?: IsArray<T[P]> extends false ? (IsObject<T[P]> extends true ? OptionalObject<T[P]> : T[P]) : T[P];
};

/**
 * Given the types `T` and `U`, it produces a new type `T` ensuring only properties in
 * common with `U` type.
 */
export type StrictObject<T, U extends AnyObject> =
  IsObjectEmpty<U> extends true
    ? T
    : IsObject<T> extends true
      ? { [P in keyof T as P extends keyof U ? P : never]: StrictObject<T[P], NonNullable<U[P]>> }
      : T;

/**
 * Given a type `T`, it produces a new `T` type that doesn't contain array types.
 */
export type FlatObject<T extends AnyObject> = Prettify<{
  [P in keyof T]: IsArray<T[P]> extends false
    ? IsObject<T[P]> extends true
      ? FlatObject<T[P]>
      : T[P]
    : IsObject<ArrayType<T[P]>> extends true
      ? FlatObject<ArrayType<T[P]>>
      : ArrayType<T[P]>;
}>;

/**
 * Given the object types `T` and `U`, it produces a new object type merging both types.
 */
export type MergeObject<T extends AnyObject, U extends AnyObject> = Prettify<{
  [P in keyof T | keyof U]: P extends keyof T
    ? P extends keyof U
      ? P extends RequiredProperties<T> | RequiredProperties<U>
        ? MergeType<T[P], U[P]>
        : MergeType<T[P], U[P]> | undefined
      : T[P]
    : P extends keyof U
      ? U[P]
      : never;
}>;

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
    ? IsObject<ExtractObject<O[P]>> extends true
      ? PartialObjectType<PartialObject<T[P], ExtractObject<O[P]>, V>, O[P]>
      : PartialObjectType<T[P], O[P]>
    : IsObject<ExtractObject<O[P]>> extends true
      ? ArrayType<T[P]> extends AnyObject
        ? PartialObjectType<PartialObject<ArrayType<T[P]>, ExtractObject<O[P]>, V>[], O[P]>
        : PartialObjectType<T[P], O[P]>
      : PartialObjectType<T[P], O[P]>;
}>;

/**
 * Given an object type `T`, it produces all the required properties from the object.
 */
export type RequiredProperties<T extends AnyObject> = keyof {
  [P in keyof T as IsUndefined<T[P]> extends true ? never : P]: true;
};

/**
 * Given an object type `T`, it produces all the optional properties from the object.
 */
export type OptionalProperties<T extends AnyObject> = keyof {
  [P in keyof T as IsUndefined<T[P]> extends true ? P : never]: true;
};

/**
 * Given a type `T`, it produces a new type allowing only `boolean` as its property values.
 * This is used in conjunction with `PartialObject`.
 *
 * @example
 * type Foo = PartialProperties<{ bar: string, baz: number }>; // { bar: boolean, baz: boolean }
 */
export type PartialProperties<T extends AnyObject> = {
  [P in keyof T]?: IsArray<T[P]> extends false
    ? IsObject<ExtractObject<T[P]>> extends true
      ? PartialProperties<ExtractObject<T[P]>> | boolean
      : boolean
    : IsObject<ExtractObject<ArrayType<T[P]>>> extends true
      ? PartialProperties<ExtractObject<ArrayType<T[P]>>> | boolean
      : boolean;
};

/**
 * Given a type `T`, it returns only the object type.
 */
type ExtractObject<T> = T extends AnyObject ? T : never;

/**
 * Helper type to determine if the given type `T` can be undefined when `U` is `true`,
 * otherwise `T` can't be undefined.
 */
type PartialObjectType<T, U> = U extends false ? T | undefined : T;

/**
 * Helper type to determine if a property exists or not in a `PartialObject`.
 *
 * - When the given `T` is `true` or an object, it returns `K` if `V` is also true.
 * - When the given `T` is `false` or not an object, it returns `K` if `V` is also false.
 * - In any other case, it returns `never`.
 */
type PartialObjectProperty<T, K, V> =
  IsObject<ExtractObject<T>> extends true ? K : T extends true ? (V extends true ? K : never) : V extends true ? never : K;
