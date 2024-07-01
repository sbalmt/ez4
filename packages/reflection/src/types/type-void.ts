import type { AllType } from './common.js';
import type { EveryType } from './types.js';

import { TypeName } from './common.js';

export type TypeVoid = {
  type: TypeName.Void;
};

export type TypeVoidEvents = {
  onTypeVoid?: (type: TypeVoid) => EveryType | null;
};

/**
 * Determines whether or not the given type is a `void` type.
 *
 * @param type Type reflection object.
 */
export const isTypeVoid = (type: AllType): type is TypeVoid => {
  return type.type === TypeName.Void;
};
