import type { AllType } from './common.js';
import type { TypeParameter } from './type-parameter.js';
import type { EveryType } from './types.js';

import { TypeName } from './common.js';

export type TypeCallback = {
  type: TypeName.Callback;
  name?: string;
  file?: string;
  module?: string | null;
  description?: string;
  parameters?: TypeParameter[];
  return?: EveryType;
};

/**
 * Determines whether or not the given type is a `callback` type.
 *
 * @param type Type reflection object.
 */
export const isTypeCallback = (type: AllType): type is TypeCallback => {
  return type.type === TypeName.Callback;
};
