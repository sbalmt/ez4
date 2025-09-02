import type { AllType } from './common';
import type { EveryType } from './types';

import { TypeName } from './common';

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
