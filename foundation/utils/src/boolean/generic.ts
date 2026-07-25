/**
 * Give the types `T`, it returns `true` when all types are the `true`.
 */
export type IsAllTrue<T extends readonly boolean[]> = boolean extends T[number] ? false : false extends T[number] ? false : true;

/**
 * Give the types `T`, it returns `true` when all types are the `false`.
 */
export type IsAllFalse<T extends readonly boolean[]> = boolean extends T[number] ? false : false extends T[number] ? true : false;
