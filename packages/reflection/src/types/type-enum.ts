import type { EnumMember } from './enum-member.js';
import type { AllType } from './common.js';

import { TypeName } from './common.js';

export type TypeEnum = {
  type: TypeName.Enum;
  name: string;
  file?: string;
  description?: string;
  members?: EnumMember[];
};

/**
 * Determines whether or not the given type is an `enum` type.
 *
 * @param type Type reflection object.
 */
export const isTypeEnum = (type: AllType): type is TypeEnum => {
  return type.type === TypeName.Enum;
};
