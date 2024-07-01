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
  const file = context.options.includePath ? getNodeFilePath(node) : null;

  const resolver = (current: Node) => {
    if (isTypeObject(current)) {
      return createObject(file);
    }

    if (isTypeLiteralNode(current)) {
      return createObject(file, tryModelMembers(current, context, state));
    }

    return null;
  };

  const result = resolver(node);
  const event = context.events.onTypeObject;

  if (result && event) {
    return event(result);
  }

  return result;
};
