import type { Node, TypeLiteralNode } from 'typescript';
import type { EveryMemberType, TypeObject, TypePosition } from '../types';
import type { Context, State } from './common';

import { isIndexSignatureDeclaration, isTypeLiteralNode, SyntaxKind } from 'typescript';

import { getPathModule } from '../utils/module';
import { getNodeFilePosition, getNodeFilePath } from '../helpers/node';
import { TypeName } from '../types';
import { tryModelMembers } from './model-members';
import { getNewState } from './common';
import { tryTypes } from './types';

export const createObject = (file: string | undefined, position: TypePosition | undefined, members?: EveryMemberType[]): TypeObject => {
  const module = file && getPathModule(file);

  return {
    type: TypeName.Object,
    ...(file && { file }),
    ...(position && { position }),
    ...(module && { module }),
    ...(members?.length && { members })
  };
};

export const isTypeObject = (node: Node) => {
  return node.kind === SyntaxKind.ObjectKeyword;
};

export const tryTypeObject = (node: Node, context: Context, state: State) => {
  if (!isTypeObject(node) && !isTypeLiteralNode(node)) {
    return undefined;
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

  const file = context.options.includeLocation ? getNodeFilePath(node) : undefined;
  const position = context.options.includeLocation ? getNodeFilePosition(node) : undefined;

  const type = createObject(file, position);

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
