import type { AllType } from './types/common.js';

import { TypeName } from './types/common.js';
import { isTypeUnion } from './types/type-union.js';
import { isTypeArray } from './types/type-array.js';

/**
 * Determines whether or not the given type is optional by having an `undefined` type.
 *
 * @param types Type reflection object.
 */
export const isOptional = (type: AllType) => {
  if (isTypeUnion(type)) {
    return type.elements.some(({ type }) => type === TypeName.Undefined);
  }

  if (isTypeArray(type)) {
    return type.element.type === TypeName.Undefined;
  }

  return false;
};
