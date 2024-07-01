import type { AllType } from './common.js';
import type { EveryType } from './types.js';

import { TypeName } from './common.js';

export type TypeArray = {
  type: TypeName.Array;
  element: EveryType;
  spread?: boolean;
};

/**
 * Determines whether or not the given type is an `array` type.
 *
 * @param type Type reflection object.
 */
export const isTypeArray = (type: AllType): type is TypeArray => {
  return type.type === TypeName.Array;
};
