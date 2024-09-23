import type { AllType } from './common.js';
import type { EveryType } from './types.js';

import { TypeName } from './common.js';

export type TypeReference = {
  type: TypeName.Reference;
  namespace?: string;
  internal?: boolean;
  index?: string;
  path: string;
};

export type TypeReferenceEvents = {
  onTypeReference?: (type: TypeReference) => EveryType | null;
};

/**
 * Determines whether or not the given type is a `reference` type.
 *
 * @param type Type reflection object.
 */
export const isTypeReference = (type: AllType): type is TypeReference => {
  return type.type === TypeName.Reference;
};
