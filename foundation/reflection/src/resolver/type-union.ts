import type { Node, UnionTypeNode } from 'typescript';
import type { EveryType, TypeUnion } from '../types';
import type { Context, State } from './common';

import { isUnionTypeNode } from 'typescript';
import { TypeName } from '../types';
import { getNewState } from './common';
import { tryTypes } from './types';

export const createUnion = (elements: EveryType[]): TypeUnion => {
  return {
    type: TypeName.Union,
    elements
  };
};

export const isTypeUnion = (node: Node): node is UnionTypeNode => {
  return isUnionTypeNode(node);
};

export const tryTypeUnion = (node: Node, context: Context, state: State) => {
  if (!isTypeUnion(node)) {
    return null;
  }

  const newState = getNewState({ types: state.types });
  const allTypes: EveryType[] = [];

  node.types.forEach((type) => {
    const elementType = tryTypes(type, context, newState);

    if (elementType) {
      allTypes.push(elementType);
    }
  });

  return createUnion(allTypes);
};
