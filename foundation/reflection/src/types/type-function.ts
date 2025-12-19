import type { AllType, TypePosition } from './common';
import type { TypeParameter } from './type-parameter';
import type { EveryType } from './types';

import { TypeName } from './common';

export type FunctionModifiers = {
  export?: boolean;
  declare?: boolean;
  async?: boolean;
};

export type TypeFunction = {
  type: TypeName.Function;
  name: string;
  file?: string;
  position?: TypePosition;
  module?: string | null;
  description?: string;
  modifiers?: FunctionModifiers;
  parameters?: TypeParameter[];
  return?: EveryType;
};

/**
 * Determines whether or not the given type is a `function` type.
 *
 * @param type Type reflection object.
 */
export const isTypeFunction = (type: AllType): type is TypeFunction => {
  return type.type === TypeName.Function;
};
