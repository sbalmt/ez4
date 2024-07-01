import type { Node, NodeArray, TypeNode } from 'typescript';
import type { InterfaceNodes } from './type-interface.js';
import type { Context, State } from './common.js';
import type { ClassNodes } from './type-class.js';

import { getNodeFilePath, isInternalType } from '../helpers/node.js';
import { tryModelMembers } from './model-members.js';
import { isTypeInterface } from './type-interface.js';
import { getTypeArguments } from './type-parameter.js';
import { createObject } from './type-object.js';
import { isTypeClass } from './type-class.js';
import { getNewState } from './common.js';

export type TypeArguments = NodeArray<TypeNode>;

export const isGenericReference = (node: Node): node is ClassNodes | InterfaceNodes => {
  return (isTypeClass(node) || isTypeInterface(node)) && !!node.typeParameters;
};

export const tryGenericReference = (
  node: Node,
  types: TypeArguments,
  context: Context,
  state: State
) => {
  if (!isGenericReference(node) || isInternalType(node)) {
    return null;
  }

  const newState = getNewState({ types: state.types });
  const newTypes = getTypeArguments(node, types, context, newState);
  const results = tryModelMembers(node, context, { ...state, types: newTypes });

  if (!results) {
    return null;
  }

  const file = context.options.includePath ? getNodeFilePath(node) : null;

  return createObject(file, results);
};
