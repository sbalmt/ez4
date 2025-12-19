import type { Node, TypeQueryNode } from 'typescript';
import type { Context, State } from './common';

import { isTypeQueryNode } from 'typescript';

import { getNodeTypeDeclaration } from '../helpers/declaration';
import { tryModelReference } from './model-reference';
import { tryTypeCallback } from './type-callback';

export const isTypeOf = (node: Node): node is TypeQueryNode => {
  return isTypeQueryNode(node);
};

export const tryTypeOf = (node: Node, context: Context, state: State) => {
  if (!isTypeOf(node)) {
    return undefined;
  }

  const declaration = getNodeTypeDeclaration(node.exprName, context.checker);

  if (!declaration) {
    return undefined;
  }

  return tryModelReference(declaration, context) || tryTypeCallback(declaration, context, state);
};
