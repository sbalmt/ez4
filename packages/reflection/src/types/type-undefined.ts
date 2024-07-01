import type { AllType } from './common.js';
import type { EveryType } from './types.js';

import { TypeName } from './common.js';

export type TypeUndefined = {
  type: TypeName.Undefined;
};

export type TypeUndefinedEvents = {
  onTypeUndefined?: (type: TypeUndefined) => EveryType | null;
};

/**
 * Determines whether or not the given type is an `undefined` type.
 *
 * @param type Type reflection object.
 */
export const isTypeUndefined = (type: AllType): type is TypeUndefined => {
  return type.type === TypeName.Undefined;
};
