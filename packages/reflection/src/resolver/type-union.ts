import type { Node, UnionTypeNode } from 'typescript';
import type { EveryType, TypeUnion } from '../types.js';
import type { Context, State } from './common.js';

import { isUnionTypeNode } from 'typescript';
import { TypeName } from '../types.js';
import { getNewState } from './common.js';
import { tryTypes } from './types.js';

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
  const unionTypes: EveryType[] = [];

  node.types.forEach((type) => {
    const elementType = tryTypes(type, context, newState);

    if (elementType) {
      unionTypes.push(elementType);
    }
  });

  return createUnion(unionTypes);
};
