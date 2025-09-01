import type { ModelProperty } from './model-property';
import type { ModelMethod } from './model-method';
import type { AllType } from './common';

import { TypeName } from './common';

export type EveryMemberType = ModelProperty | ModelMethod;

/**
 * Determines whether or not the given type is a `property` or `method` type.
 *
 * @param type Type reflection object.
 */
export const isModelMember = (type: AllType): type is EveryMemberType => {
  return type.type === TypeName.Property || type.type === TypeName.Method;
};
