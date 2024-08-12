/**
 * Based on the given type `T`, it returns `true` when `T` is `any`, otherwise returns `false`;
 */
export type IsAny<T> = boolean extends (T extends never ? true : false) ? true : false;
