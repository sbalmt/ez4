/**
 * Give the type `T`, it returns `true` when the type is strictly `true`.
 */
export type IsTrue<T extends boolean> = boolean extends T ? false : false extends T ? false : true;

/**
 * Give the type `T`, it returns `true` when the type is strictly `false`.
 */
export type IsFalse<T extends boolean> = boolean extends T ? false : false extends T ? true : false;

/**
 * Give the types `T`, it returns `true` when all types are strictly `true`.
 */
export type IsAllTrue<T extends readonly boolean[]> = IsTrue<T[number]>;

/**
 * Give the types `T`, it returns `true` when all types are strictly `false`.
 */
export type IsAllFalse<T extends readonly boolean[]> = IsFalse<T[number]>;
