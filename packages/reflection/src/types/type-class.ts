import type { ModelHeritage } from './model-heritage.js';
import type { EveryMemberType } from './model-members.js';
import type { AllType } from './common.js';

import { TypeName } from './common.js';

export type ClassModifiers = {
  export?: boolean;
  declare?: boolean;
  abstract?: boolean;
};

export type TypeClass = {
  type: TypeName.Class;
  name: string;
  file?: string;
  description?: string;
  modifiers?: ClassModifiers;
  heritage?: ModelHeritage[];
  members?: EveryMemberType[];
};

/**
 * Determines whether or not the given type is a `class` type.
 *
 * @param type Type reflection object.
 */
export const isTypeClass = (type: AllType): type is TypeClass => {
  return type.type === TypeName.Class;
};
