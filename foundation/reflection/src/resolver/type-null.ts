import type { Node } from 'typescript';
import type { TypeNull } from '../types';
import type { Context } from './common';

import { SyntaxKind, isLiteralTypeNode } from 'typescript';
import { TypeName } from '../types';

export type NullValueType = Extract<keyof TypeNull, 'literal' | 'default'>;

export const createNull = (valueType?: NullValueType, value?: boolean): TypeNull => {
  return {
    type: TypeName.Null,
    ...(valueType && value !== undefined && { [valueType]: value })
  };
};

export const isTypeNull = (node: Node) => {
  return node.kind === SyntaxKind.NullKeyword;
};

export const tryTypeNull = (node: Node, context: Context) => {
  const resolver = (current: Node, type: NullValueType) => {
    if (isTypeNull(current)) {
      return createNull(type, true);
    }

    if (isLiteralTypeNode(current)) {
      return resolver(current.literal, 'literal');
    }

    return null;
  };

  const result = resolver(node, 'default');
  const event = context.events.onTypeNull;

  if (result && event) {
    return event(result);
  }

  return result;
};
