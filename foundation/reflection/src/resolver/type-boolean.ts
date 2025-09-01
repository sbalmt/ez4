import type { FalseLiteral, Node, TrueLiteral } from 'typescript';
import type { TypeBoolean } from '../types';
import type { Context } from './common';

import { SyntaxKind, isLiteralTypeNode } from 'typescript';
import { TypeName } from '../types';

export type BooleanValueType = Extract<keyof TypeBoolean, 'literal' | 'default'>;

export const createBoolean = (valueType?: BooleanValueType, value?: boolean): TypeBoolean => {
  return {
    type: TypeName.Boolean,
    ...(valueType && value !== undefined && { [valueType]: value })
  };
};

export const isTypeTrue = (node: Node): node is TrueLiteral => {
  return node.kind === SyntaxKind.TrueKeyword;
};

export const isTypeFalse = (node: Node): node is FalseLiteral => {
  return node.kind === SyntaxKind.FalseKeyword;
};

export const isTypeBoolean = (node: Node) => {
  return node.kind === SyntaxKind.BooleanKeyword;
};

export const tryTypeBoolean = (node: Node, { events }: Context) => {
  const resolver = (current: Node, type: BooleanValueType) => {
    if (isLiteralTypeNode(current)) {
      return resolver(current.literal, 'literal');
    }

    if (isTypeBoolean(current)) {
      return createBoolean();
    }

    if (isTypeTrue(current)) {
      return createBoolean(type, true);
    }

    if (isTypeFalse(current)) {
      return createBoolean(type, false);
    }

    return null;
  };

  const result = resolver(node, 'default');
  const event = events.onTypeBoolean;

  if (result && event) {
    return event(result);
  }

  return result;
};
