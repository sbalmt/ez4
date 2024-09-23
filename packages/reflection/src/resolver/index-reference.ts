import type { IndexedAccessTypeNode, Node, NodeArray, TypeNode } from 'typescript';
import type { Context, State } from './common.js';

import { isIndexedAccessTypeNode } from 'typescript';

import { isTypeReference } from '../types/type-reference.js';
import { getPropertyName } from '../helpers/identifier.js';
import { tryTypeReference } from './type-reference.js';

export type TypeArguments = NodeArray<TypeNode>;

export const isIndexReference = (node: Node): node is IndexedAccessTypeNode => {
  return isIndexedAccessTypeNode(node);
};

export const tryIndexReference = (node: Node, context: Context, state: State) => {
  if (!isIndexReference(node)) {
    return null;
  }

  const reflectedType = tryTypeReference(node.objectType, context, state);

  if (reflectedType && isTypeReference(reflectedType)) {
    reflectedType.index = getPropertyName(node.indexType, context.checker);
  }

  return reflectedType;
};
