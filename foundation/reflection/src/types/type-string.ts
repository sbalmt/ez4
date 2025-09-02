import type { AllType } from './common';
import type { EveryType } from './types';

import { TypeName } from './common';

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
