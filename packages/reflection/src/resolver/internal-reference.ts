import type { InterfaceDeclaration, Node, NodeArray, TypeNode } from 'typescript';
import type { Context, State } from './common.js';

import { isInternalType } from '../helpers/node.js';
import { isTypeInterface } from './type-interface.js';
import { createArray } from './type-array.js';
import { tryTypes } from './types.js';

export type TypeArguments = NodeArray<TypeNode>;

export const isInternalReference = (node: Node): node is InterfaceDeclaration => {
  return isTypeInterface(node) && isInternalType(node);
};

export const tryInternalReference = (
  node: Node,
  types: TypeArguments | undefined,
  context: Context,
  state: State
) => {
  if (!types || !isInternalReference(node)) {
    return null;
  }

  const name = node.name.getText();

  switch (name) {
    case 'Promise': {
      return tryTypes(types[0], context, state);
    }

    case 'ArrayLike': {
      const element = tryTypes(types[0], context, state);

      if (element) {
        return createArray(element, state);
      }

      break;
    }
  }

  return null;
};
