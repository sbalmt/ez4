import type { AllType } from './common.js';

import type { TypeBoolean } from './type-boolean.js';
import type { TypeNumber } from './type-number.js';
import type { TypeString } from './type-string.js';

import { TypeName } from './common.js';

export type ScalarTypeName = TypeName.Boolean | TypeName.Number | TypeName.String;

export type TypeScalar = TypeBoolean | TypeNumber | TypeString;

/**
 * Determines whether or not the given type is a scalar type.
 *
 * @param type Type reflection object.
 */
export const isTypeScalar = (type: AllType): type is TypeScalar => {
  return [TypeName.Boolean, TypeName.Number, TypeName.String].includes(type.type);
};
