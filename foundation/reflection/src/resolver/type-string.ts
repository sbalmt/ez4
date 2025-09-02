import type { Node, StringLiteral } from 'typescript';
import type { TypeString } from '../types';
import type { Context } from './common';

import { SyntaxKind, isLiteralTypeNode, isNoSubstitutionTemplateLiteral } from 'typescript';
import { TypeName } from '../types';

export type StringValueType = Extract<keyof TypeString, 'literal' | 'default'>;

export const createString = (valueType?: StringValueType, value?: string): TypeString => {
  return {
    type: TypeName.String,
    ...(valueType && value !== undefined && { [valueType]: value })
  };
};

export const isTypeString = (node: Node) => {
  return node.kind === SyntaxKind.StringKeyword;
};

export const isTypeLiteralString = (node: Node): node is StringLiteral => {
  return node.kind === SyntaxKind.StringLiteral;
};

export const tryTypeString = (node: Node, context: Context) => {
  const resolver = (current: Node, type: StringValueType) => {
    if (isLiteralTypeNode(current)) {
      return resolver(current.literal, 'literal');
    }

    if (isTypeString(current)) {
      return createString();
    }

    if (isTypeLiteralString(current)) {
      return createString(type, current.text);
    }

    if (isNoSubstitutionTemplateLiteral(current)) {
      return createString(type, current.text);
    }

    return null;
  };

  const result = resolver(node, 'default');
  const event = context.events.onTypeString;

  if (result && event) {
    return event(result);
  }

  return result;
};
