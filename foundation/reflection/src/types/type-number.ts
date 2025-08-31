import type { AllType } from './common.js';
import type { EveryType } from './types.js';

import { TypeName } from './common.js';

export type TypeNumber = {
  type: TypeName.Number;
  literal?: number;
  default?: number;
};

export type TypeNumberEvents = {
  onTypeNumber?: (type: TypeNumber) => EveryType | null;
};

/**
 * Determines whether or not the given type is a `number` type.
 *
 * @param type Type reflection object.
 */
export const isTypeNumber = (type: AllType): type is TypeNumber => {
  return type.type === TypeName.Number;
};
