import type { EveryType, TypeTuple } from '@ez4/reflection';

import { isTypeTuple } from '@ez4/reflection';

export const getTupleElements = (tuple: TypeTuple): EveryType[] => {
  return tuple.elements.flatMap((element) => {
    if (isTypeTuple(element) && element.spread) {
      return getTupleElements(element);
    }

    return element;
  });
};
