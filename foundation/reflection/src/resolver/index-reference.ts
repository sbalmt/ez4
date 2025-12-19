import type { IndexedAccessTypeNode, Node, NodeArray, TypeNode } from 'typescript';
import type { Context, State } from './common';

import { isIndexedAccessTypeNode } from 'typescript';

import { isTypeReference } from '../types/type-reference';
import { getPropertyName } from '../helpers/identifier';
import { tryTypeReference } from './type-reference';

export type TypeArguments = NodeArray<TypeNode>;

export const isIndexReference = (node: Node): node is IndexedAccessTypeNode => {
  return isIndexedAccessTypeNode(node);
};

export const tryIndexReference = (node: Node, context: Context, state: State) => {
  if (!isIndexReference(node)) {
    return undefined;
  }

  const reflectedType = tryTypeReference(node.objectType, context, state);

  if (!reflectedType || !isTypeReference(reflectedType)) {
    return reflectedType;
  }

  const index = getPropertyName(node.indexType, context.checker);

  return {
    ...reflectedType,
    index
  };
};
