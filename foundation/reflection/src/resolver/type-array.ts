import type { ArrayTypeNode, Node } from 'typescript';
import type { TypeArray, EveryType } from '../types';
import type { ArrayState, Context, State } from './common';

import { isArrayTypeNode } from 'typescript';
import { TypeName } from '../types';
import { tryTypes } from './types';

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
    return undefined;
  }

  const elementType = tryTypes(node.elementType, context, state);

  if (!elementType) {
    return undefined;
  }

  return createArray(elementType, state);
};
