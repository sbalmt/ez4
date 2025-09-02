import type { AllType } from './common';
import type { EveryType } from './types';

import { TypeName } from './common';

export type TypeAny = {
  type: TypeName.Any;
};

export type TypeAnyEvents = {
  onTypeAny?: (type: TypeAny) => EveryType | null;
};

/**
 * Determines whether or not the given type is an `any` type.
 *
 * @param type Type reflection object.
 */
export const isTypeAny = (type: AllType): type is TypeAny => {
  return type.type === TypeName.Any;
};
