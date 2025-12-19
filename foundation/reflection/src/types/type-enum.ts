import type { AllType, TypePosition } from './common';
import type { EnumMember } from './enum-member';

import { TypeName } from './common';

export type TypeEnum = {
  type: TypeName.Enum;
  name: string;
  file?: string;
  position?: TypePosition;
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
