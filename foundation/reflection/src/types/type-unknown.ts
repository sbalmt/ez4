import type { AllType } from './common.js';
import type { EveryType } from './types.js';

import { TypeName } from './common.js';

export type TypeUnknown = {
  type: TypeName.Unknown;
};

export type TypeUnknownEvents = {
  onTypeUnknown?: (type: TypeUnknown) => EveryType | null;
};

/**
 * Determines whether or not the given type is an `unknown` type.
 *
 * @param type Type reflection object.
 */
export const isTypeUnknown = (type: AllType): type is TypeUnknown => {
  return type.type === TypeName.Unknown;
};
