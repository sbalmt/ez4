import type { AllType } from './common';
import type { EveryType } from './types';

import { TypeName } from './common';

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
