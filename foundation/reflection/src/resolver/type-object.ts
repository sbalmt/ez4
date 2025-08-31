import type { Node, TypeLiteralNode } from 'typescript';
import type { EveryMemberType, TypeObject } from '../types.js';
import { getNewState, type Context, type State } from './common.js';

import { isIndexSignatureDeclaration, isTypeLiteralNode, SyntaxKind } from 'typescript';

import { getPathModule } from '../utils/module.js';
import { getNodeFilePath } from '../helpers/node.js';
import { TypeName } from '../types.js';
import { tryModelMembers } from './model-members.js';
import { tryTypes } from './types.js';

export const createObject = (file: string | null, members?: EveryMemberType[]): TypeObject => {
  return {
    type: TypeName.Object,
    ...(file && { file }),
    ...(file && { module: getPathModule(file) }),
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
  const type = createObject(file);

  if (!generic) {
    context.cache.set(node, type);
  }

  if (isTypeLiteralNode(node)) {
    type.members = tryDynamicMembers(node, context, state) || tryModelMembers(node, context, state);
  }

  if (event) {
    return event(type);
  }

  return type;
};

const tryDynamicMembers = (node: TypeLiteralNode, context: Context, state: State) => {
  const member = node.members[0];

  if (!member || !isIndexSignatureDeclaration(member)) {
    return;
  }

  const [memberName] = member.parameters;

  if (!memberName?.type) {
    return;
  }

  const valueState = getNewState({ types: state.types });
  const valueType = tryTypes(member.type, context, valueState);

  if (!valueType) {
    return;
  }

  const indexState = getNewState({ types: state.types });
  const indexType = tryTypes(memberName.type, context, indexState);

  if (!indexType) {
    return;
  }

  return {
    index: indexType,
    value: valueType
  };
};
