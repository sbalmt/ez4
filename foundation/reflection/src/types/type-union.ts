import type { AllType } from './common';
import type { EveryType } from './types';

import { TypeName } from './common';

export type TypeUnion = {
  type: TypeName.Union;
  elements: EveryType[];
};

/**
 * Determines whether or not the given type is an `union` type.
 *
 * @param type Type reflection object.
 */
export const isTypeUnion = (type: AllType): type is TypeUnion => {
  return type.type === TypeName.Union;
};

/**
 * Remove from the given union type any element corresponding to the given element types.
 *
 * @param target Union type.
 * @param types List of element types.
 * @returns Returns a new union type without the given elements.
 * If the resulting union type has only one element, this element is returned instead.
 * If the resulting union type has no elements, `null` is returned instead.
 */
export const removeTypeUnionElements = (target: TypeUnion, types: TypeName[]): EveryType | null => {
  const elements = target.elements.filter((element) => !types.includes(element.type));

  if (elements.length === 0) {
    return null;
  }

  if (elements.length === 1) {
    return elements[0];
  }

  return {
    type: TypeName.Union,
    elements
  };
};

/**
 * Append to the given type all the given new elements and transform it into a union type if needed.
 *
 * @param target Target type.
 * @param elements Element to append.
 * @returns Returns a union type containing all types.
 */
export const appendTypeUnionElements = (target: EveryType, elements: EveryType[]): TypeUnion => {
  if (isTypeUnion(target)) {
    target.elements.push(...elements);
  }

  return {
    type: TypeName.Union,
    elements: [target, ...elements]
  };
};
