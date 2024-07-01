/**
 * Represents any object.
 */
export type AnyObject = Record<any, any>;

/**
 * Based on the given `T` object, it returns a new object type allowing only `true` as its
 * property values. This is used in conjunction with `PartialObject`.
 *
 * @example
 * type Foo = ObjectProperties<{ bar: string, baz: number }>; // { bar: true, baz: true }
 */
export type ObjectProperties<T extends AnyObject> = {
  [P in keyof T]?: T[P] extends AnyObject ? ObjectProperties<T[P]> | true : true;
};

/**
 * Based on the given `T` and `O` objects, it returns a new object type containing only
 * properties that are `true` in `O`, the property type follows the same property in `T`.
 * This is used in conjunction with `ObjectProperties`.
 * 
 @example
 type Foo = PartialObject<{ bar: string, baz: number }, { bar: true }>; // { bar: string }
 */
export type PartialObject<T extends AnyObject, O extends AnyObject> = {
  [P in keyof T as NonNullable<O[P]> extends true ? never : P]: O[P] extends AnyObject
    ? PartialObject<T[P], O[P]>
    : T[P];
};
