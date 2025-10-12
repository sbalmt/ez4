import type { AnyObject } from '../object/generics';

import { readFile } from 'node:fs/promises';
import { hash } from 'node:crypto';

/**
 * Generate a md5 hash for the given file.
 *
 * @param path Path to the file.
 * @returns Returns the corresponding md5 hash.
 */
export const hashFile = async (path: string) => {
  return hashData(await readFile(path));
};

/**
 * Generates a md5 hash for the given list of values.
 *
 * @param values List of string and/or `Buffer`
 * @returns Returns the corresponding md5 hash.
 */
export const hashData = <T extends string | Buffer>(...values: T[]) => {
  return hash('md5', values.join(':'));
};

/**
 * Generates a md5 hash for the given object.
 *
 * @param value Object value.
 * @returns Returns the corresponding md5 hash.
 */
export const hashObject = <T extends AnyObject>(value: T) => {
  return hashData(JSON.stringify(value));
};
