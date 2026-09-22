import type { AllType } from './types/common';

import { isTypeUnion } from './types/type-union';
import { TypeName } from './types/common';

/**
 * Determines whether or not the given type is optional by having an `undefined` type.
 *
 * @param types Type reflection object.
 */
export const isOptional = (type: AllType) => {
  if (isTypeUnion(type)) {
    return type.elements.some(({ type }) => type === TypeName.Undefined);
  }

  return false;
};
