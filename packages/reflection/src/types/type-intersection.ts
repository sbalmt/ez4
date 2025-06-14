import type { AllType } from './common.js';
import type { EveryType } from './types.js';

import { TypeName } from './common.js';

export type TypeIntersection = {
  type: TypeName.Intersection;
  file?: string;
  elements: EveryType[];
};

/**
 * Determines whether or not the given type is an `intersection` type.
 *
 * @param type Type reflection object.
 */
export const isTypeIntersection = (type: AllType): type is TypeIntersection => {
  return type.type === TypeName.Intersection;
};
