import type { Node, NodeArray, TypeNode } from 'typescript';
import type { TypeObject } from '../types';
import type { InterfaceNodes } from './type-interface';
import type { Context, State } from './common';
import type { ClassNodes } from './type-class';

import { getNodeFilePosition, getNodeFilePath, isInternalType } from '../helpers/node';
import { tryModelMembers } from './model-members';
import { isTypeInterface } from './type-interface';
import { getTypeArguments } from './type-parameter';
import { createObject } from './type-object';
import { isTypeClass } from './type-class';
import { getNewState } from './common';

export type TypeArguments = NodeArray<TypeNode>;

export const isGenericReference = (node: Node): node is ClassNodes | InterfaceNodes => {
  return (isTypeClass(node) || isTypeInterface(node)) && !!node.typeParameters;
};

export const tryGenericReference = (node: Node, types: TypeArguments | undefined, context: Context, state: State) => {
  if (!types || !isGenericReference(node) || isInternalType(node)) {
    return undefined;
  }

  if (context.cache.has(types)) {
    return context.cache.get(types) as TypeObject;
  }

  const file = context.options.includePath ? getNodeFilePath(node) : undefined;
  const position = context.options.includePath ? getNodeFilePosition(node) : undefined;

  const reflectedType = createObject(file, position);

  context.cache.set(types, reflectedType);

  const newState = getNewState({ types: state.types });
  const newTypes = getTypeArguments(node, types, context, newState);

  const memberTypes = tryModelMembers(node, context, {
    ...state,
    types: newTypes
  });

  if (memberTypes?.length) {
    reflectedType.members = memberTypes;
  }

  return reflectedType;
};
