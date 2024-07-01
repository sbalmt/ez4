import type { AllType } from './common.js';
import type { EveryType } from './types.js';

import { TypeName } from './common.js';

export type TypeNever = {
  type: TypeName.Never;
};

export type TypeNeverEvents = {
  onTypeNever?: (type: TypeNever) => EveryType | null;
};

/**
 * Determines whether or not the given type is a `never` type.
 *
 * @param type Type reflection object.
 */
export const isTypeNever = (type: AllType): type is TypeNever => {
  return type.type === TypeName.Never;
};
