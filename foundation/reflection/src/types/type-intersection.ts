import type { AllType, TypePosition } from './common';
import type { EveryType } from './types';

import { TypeName } from './common';

export type TypeIntersection = {
  type: TypeName.Intersection;
  file?: string;
  position?: TypePosition;
  module?: string | null;
  elements: EveryType[];
};

export type TypeIntersectionEvents = {
  onTypeIntersection?: (type: TypeIntersection) => EveryType | null;
};

/**
 * Determines whether or not the given type is an `intersection` type.
 *
 * @param type Type reflection object.
 */
export const isTypeIntersection = (type: AllType): type is TypeIntersection => {
  return type.type === TypeName.Intersection;
};
