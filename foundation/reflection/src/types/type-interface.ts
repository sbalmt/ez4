import type { AllType, TypePosition } from './common';
import type { EveryMemberType } from './model-members';
import type { ModelHeritage } from './model-heritage';

import { TypeName } from './common';

export type InterfaceModifiers = {
  export?: boolean;
  declare?: boolean;
};

export type TypeInterface = {
  type: TypeName.Interface;
  name: string;
  file?: string;
  position?: TypePosition;
  module?: string | null;
  description?: string;
  modifiers?: InterfaceModifiers;
  heritage?: ModelHeritage[];
  members?: EveryMemberType[];
};

/**
 * Determines whether or not the given type is an `interface` type.
 *
 * @param type Type reflection object.
 */
export const isTypeInterface = (type: AllType): type is TypeInterface => {
  return type.type === TypeName.Interface;
};

/**
 * Merge the given `source` within the given `target` to create a new interface containing the
 * `target`'s name, the `target`'s or `source`'s description, and heritage and members from both of them.
 *
 * @param source Source interface.
 * @param target Target interface.
 * @returns Returns the new interface containing the merge result.
 */
export const mergeTypeInterface = (source: TypeInterface, target: TypeInterface): TypeInterface => {
  const description = target.description ?? source.description;

  const heritage: ModelHeritage[] = [];
  const members: EveryMemberType[] = [];

  if (target.heritage) {
    heritage.push(...target.heritage);
  }

  if (source.heritage) {
    heritage.push(...source.heritage);
  }

  if (target.members) {
    members.push(...target.members);
  }

  if (source.members) {
    members.push(...source.members);
  }

  return {
    type: TypeName.Interface,
    name: target.name,
    ...(description && { description }),
    ...(heritage.length && { heritage }),
    ...(members.length && { members })
  };
};
