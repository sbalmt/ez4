import type { AllType } from './common';
import type { EveryMemberType } from './model-members';
import type { EveryType } from './types';

import { TypeName } from './common';

export type TypeObject = {
  type: TypeName.Object;
  file?: string;
  module?: string | null;
  members?: DynamicObjectMember | EveryMemberType[];
};

export type DynamicObjectMember = {
  index: EveryType;
  value: EveryType;
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
