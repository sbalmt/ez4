import type { AllType } from './common.js';
import type { EveryType } from './types.js';

import { TypeName } from './common.js';

export type TypeTuple = {
  type: TypeName.Tuple;
  elements: EveryType[];
  spread?: boolean;
};

/**
 * Determines whether or not the given type is a `tuple` type.
 *
 * @param type Type reflection object.
 */
export const isTypeTuple = (type: AllType): type is TypeTuple => {
  return type.type === TypeName.Tuple;
};
