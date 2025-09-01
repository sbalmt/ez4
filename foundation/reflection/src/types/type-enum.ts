import type { EnumMember } from './enum-member';
import type { AllType } from './common';

import { TypeName } from './common';

export type TypeEnum = {
  type: TypeName.Enum;
  name: string;
  file?: string;
  module?: string | null;
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
