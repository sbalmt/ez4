import type { AllType } from './common.js';
import type { EveryType } from './types.js';

import { TypeName } from './common.js';

export type TypeUnion = {
  type: TypeName.Union;
  elements: EveryType[];
};

/**
 * Determines whether or not the given type is an `union` type.
 *
 * @param type Type reflection object.
 */
export const isTypeUnion = (type: AllType): type is TypeUnion => {
  return type.type === TypeName.Union;
};
