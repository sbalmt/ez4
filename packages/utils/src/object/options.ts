import type { AnyObject, PartialProperties } from './generics.js';

export type ObjectOptions<T extends AnyObject> = {
  exclude?: PartialProperties<T>;
  depth?: number;
};
