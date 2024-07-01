import type { AllType } from './common.js';
import type { EveryType } from './types.js';

import { TypeName } from './common.js';

export type TypeParameter = {
  type: TypeName.Parameter;
  name: string;
  description?: string;
  value: EveryType;
};

/**
 * Determines whether or not the given type is a `parameter` type.
 *
 * @param type Type reflection object.
 */
export const isTypeParameter = (type: AllType): type is TypeParameter => {
  return type.type === TypeName.Parameter;
};
