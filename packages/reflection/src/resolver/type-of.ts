import type { Node, TypeQueryNode } from 'typescript';
import type { Context, State } from './common.js';

import { isTypeQueryNode } from 'typescript';

import { getNodeTypeDeclaration } from '../helpers/declaration.js';
import { tryModelReference } from './model-reference.js';
import { tryTypeCallback } from './type-callback.js';

export const isTypeOf = (node: Node): node is TypeQueryNode => {
  return isTypeQueryNode(node);
};

export const tryTypeOf = (node: Node, context: Context, state: State) => {
  if (!isTypeOf(node)) {
    return null;
  }

  const declaration = getNodeTypeDeclaration(node.exprName, context.checker);

  if (!declaration) {
    return null;
  }

  return tryModelReference(declaration, context) || tryTypeCallback(declaration, context, state);
};
