/**
 * Represents any object.
 */
export type AnyObject = Record<any, any>;

/**
 * Based on the given object type `T`, it produces a new object type allowing its original
 * type, `undefined` and `null` for all first-level properties.
 */
export type Incomplete<T> = {
  [P in keyof T]?: T[P] | null;
};

/**
 * Based on the given object type `T`, it produces a new object type having all first-level
 * and nested properties as optional.
 */
export type DeepPartial<T extends AnyObject> = {
  [P in keyof T]?: T[P] extends AnyObject ? DeepPartial<T[P]> : T[P];
};

/**
 * Based on the given `T` object, it produces a new object type allowing only `boolean`
 * as its property values. This is used in conjunction with `PartialObject`.
 *
 * @example
 * type Foo = PartialProperties<{ bar: string, baz: number }>; // { bar: true, baz: true }
 */
export type PartialProperties<T extends AnyObject> = {
  [P in keyof T]?: T[P] extends AnyObject ? PartialProperties<T[P]> | boolean : boolean;
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
  [P in keyof T as PartialObjectProperty<O[P], P, V>]: O[P] extends AnyObject
    ? PartialObject<T[P], O[P], V>
    : T[P];
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
