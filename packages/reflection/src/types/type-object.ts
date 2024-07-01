import type { AllType } from './common.js';
import type { EveryMemberType } from './model-members.js';
import type { EveryType } from './types.js';

import { TypeName } from './common.js';

export type TypeObject = {
  type: TypeName.Object;
  file?: string;
  members?: EveryMemberType[];
};

export type TypeObjectEvents = {
  onTypeObject?: (type: TypeObject) => EveryType | null;
};

/**
 * Determines whether or not the given type is an `object` type.
 *
 * @param type Type reflection object.
 */
export const isTypeObject = (type: AllType): type is TypeObject => {
  return type.type === TypeName.Object;
};
