import type { AllType } from './common.js';
import type { EveryType } from './types.js';

import { TypeName } from './common.js';

export type TypeString = {
  type: TypeName.String;
  literal?: string;
  default?: string;
};

export type TypeStringEvents = {
  onTypeString?: (type: TypeString) => EveryType | null;
};

/**
 * Determines whether or not the given type is a `string` type.
 *
 * @param type Type reflection object.
 */
export const isTypeString = (type: AllType): type is TypeString => {
  return type.type === TypeName.String;
};
