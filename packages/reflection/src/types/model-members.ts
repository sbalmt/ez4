import type { ModelProperty } from './model-property.js';
import type { ModelMethod } from './model-method.js';
import type { AllType } from './common.js';

import { TypeName } from './common.js';

export type EveryMemberType = ModelProperty | ModelMethod;

/**
 * Determines whether or not the given type is a `property` or `method` type.
 *
 * @param type Type reflection object.
 */
export const isModelMember = (type: AllType): type is EveryMemberType => {
  return type.type === TypeName.Property || type.type === TypeName.Method;
};
