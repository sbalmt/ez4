import type { Node } from 'typescript';
import type { EveryMemberType, TypeObject } from '../types.js';
import type { Context, State } from './common.js';

import { isTypeLiteralNode, SyntaxKind } from 'typescript';

import { TypeName } from '../types.js';
import { getNodeFilePath } from '../helpers/node.js';
import { tryModelMembers } from './model-members.js';

export const createObject = (file: string | null, members?: EveryMemberType[]): TypeObject => {
  return {
    type: TypeName.Object,
    ...(file && { file }),
    ...(members?.length && { members })
  };
};

export const isTypeObject = (node: Node) => {
  return node.kind === SyntaxKind.ObjectKeyword;
};

export const tryTypeObject = (node: Node, context: Context, state: State) => {
  if (!isTypeObject(node) && !isTypeLiteralNode(node)) {
    return null;
  }

  const generic = !!Object.keys(state.types).length;
  const event = context.events.onTypeObject;

  if (!generic && context.cache.has(node)) {
    const cache = context.cache.get(node) as TypeObject;

    if (event) {
      return event(cache);
    }

    return cache;
  }

  const file = context.options.includePath ? getNodeFilePath(node) : null;
  const reflectedType = createObject(file);

  if (!generic) {
    context.cache.set(node, reflectedType);
  }

  if (isTypeLiteralNode(node)) {
    reflectedType.members = tryModelMembers(node, context, state);
  }

  if (event) {
    return event(reflectedType);
  }

  return reflectedType;
};
