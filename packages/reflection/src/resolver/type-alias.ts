import type { Node, NodeArray, TypeAliasDeclaration, TypeNode } from 'typescript';
import type { Context, State } from './common.js';

import { isTypeAliasDeclaration } from 'typescript';
import { getTypeArguments } from './type-parameter.js';
import { getNewState } from './common.js';
import { tryTypes } from './types.js';

export type TypeArguments = NodeArray<TypeNode>;

export const isTypeAlias = (node: Node): node is TypeAliasDeclaration => {
  return isTypeAliasDeclaration(node);
};

export const tryTypeAlias = (
  node: Node,
  types: TypeArguments | undefined,
  context: Context,
  state: State
) => {
  if (!isTypeAlias(node)) {
    return null;
  }

  if (!types) {
    return tryTypes(node.type, context, state);
  }

  const newState = getNewState({ types: state.types });
  const newTypes = getTypeArguments(node, types, context, newState);

  return tryTypes(node.type, context, { ...state, types: newTypes });
};
