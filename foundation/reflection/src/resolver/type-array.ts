import type { ArrayTypeNode, Node } from 'typescript';
import type { TypeArray, EveryType } from '../types.js';
import type { ArrayState, Context, State } from './common.js';

import { isArrayTypeNode } from 'typescript';
import { TypeName } from '../types.js';
import { tryTypes } from './types.js';

export const createArray = (element: EveryType, state: ArrayState): TypeArray => {
  const { spread } = state;

  return {
    type: TypeName.Array,
    ...(spread && { spread }),
    element
  };
};

export const isTypeArray = (node: Node): node is ArrayTypeNode => {
  return isArrayTypeNode(node);
};

export const tryTypeArray = (node: Node, context: Context, state: State) => {
  if (!isTypeArray(node)) {
    return null;
  }

  const elementType = tryTypes(node.elementType, context, state);

  if (!elementType) {
    return null;
  }

  return createArray(elementType, state);
};
