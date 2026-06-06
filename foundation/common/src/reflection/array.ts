import type { TypeTuple } from '@ez4/reflection';

import { isTypeObject, isTypeScalar, isTypeTuple } from '@ez4/reflection';
import { getPlainObject } from './object';

export const getPlainArray = (tuple: TypeTuple) => {
  const results: unknown[] = [];

  for (const element of tuple.elements) {
    if (isTypeScalar(element)) {
      results.push(element.literal);
    } else if (isTypeObject(element)) {
      results.push(getPlainObject(element));
    } else if (isTypeTuple(element)) {
      results.push(getPlainArray(element));
    }
  }

  return results;
};
