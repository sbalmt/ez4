import type { AllType } from './common';

import type { TypeBoolean } from './type-boolean';
import type { TypeNumber } from './type-number';
import type { TypeString } from './type-string';

import { TypeName } from './common';

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
