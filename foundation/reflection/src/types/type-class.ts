import type { AllType, TypePosition, TypeTag } from './common';
import type { EveryMemberType } from './model-members';
import type { ModelHeritage } from './model-heritage';
import type { TypeInterface } from './type-interface';

import { TypeName } from './common';

export type ClassModifiers = {
  export?: boolean;
  declare?: boolean;
  abstract?: boolean;
};

export type TypeClass = {
  type: TypeName.Class;
  name: string;
  file?: string;
  position?: TypePosition;
  module?: string | null;
  description?: string;
  tags?: TypeTag[];
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

/**
 * Merge the given `source` interface within the given `target` class to create a new class containing
 * everything from the `target`, the `target`'s or `source`'s description, and heritage and members from
 * both of them. It's the declaration merging between a class and an interface sharing the same name.
 *
 * @param source Source interface.
 * @param target Target class.
 * @returns Returns the new class containing the merge result.
 */
export const mergeTypeClass = (source: TypeInterface, target: TypeClass): TypeClass => {
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
    ...target,
    ...(description && { description }),
    ...(heritage.length && { heritage }),
    ...(members.length && { members })
  };
};
