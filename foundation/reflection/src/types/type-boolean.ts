import type { AllType } from './common';
import type { EveryType } from './types';

import { TypeName } from './common';

export type TypeBoolean = {
  type: TypeName.Boolean;
  literal?: boolean;
  default?: boolean;
};

export type TypeBooleanEvents = {
  onTypeBoolean?: (type: TypeBoolean) => EveryType | null;
};

/**
 * Determines whether or not the given type is a `boolean` type.
 *
 * @param type Type reflection object.
 */
export const isTypeBoolean = (type: AllType): type is TypeBoolean => {
  return type.type === TypeName.Boolean;
};
