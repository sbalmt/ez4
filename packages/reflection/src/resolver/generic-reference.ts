import type { Node, NodeArray, TypeNode } from 'typescript';
import type { TypeObject } from '../types.js';
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
  types: TypeArguments | undefined,
  context: Context,
  state: State
) => {
  if (!types || !isGenericReference(node) || isInternalType(node)) {
    return null;
  }

  if (context.cache.has(types)) {
    return context.cache.get(types) as TypeObject;
  }

  const file = context.options.includePath ? getNodeFilePath(node) : null;
  const reflectedType = createObject(file);

  context.cache.set(types, reflectedType);

  const newState = getNewState({ types: state.types });
  const newTypes = getTypeArguments(node, types, context, newState);

  const memberTypes = tryModelMembers(node, context, { ...state, types: newTypes });

  if (memberTypes?.length) {
    reflectedType.members = memberTypes;
  }

  return reflectedType;
};
