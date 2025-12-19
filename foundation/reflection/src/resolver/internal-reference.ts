import type { InterfaceDeclaration, Node, NodeArray, TypeNode } from 'typescript';
import type { Context, State } from './common';

import { isInternalType } from '../helpers/node';
import { isTypeInterface } from './type-interface';
import { createArray } from './type-array';
import { tryTypes } from './types';

export type TypeArguments = NodeArray<TypeNode>;

export const isInternalReference = (node: Node): node is InterfaceDeclaration => {
  return isTypeInterface(node) && isInternalType(node);
};

export const tryInternalReference = (node: Node, types: TypeArguments | undefined, context: Context, state: State) => {
  if (!types || !isInternalReference(node)) {
    return undefined;
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

  return undefined;
};
