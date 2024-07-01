import type { Node, NumericLiteral, PrefixUnaryExpression } from 'typescript';
import type { TypeNumber } from '../types.js';
import type { Context } from './common.js';

import { SyntaxKind, isLiteralTypeNode, isPrefixUnaryExpression } from 'typescript';
import { TypeName } from '../types.js';

export type NumberValueType = Extract<keyof TypeNumber, 'literal' | 'default'>;

export const createNumber = (valueType?: NumberValueType, value?: number): TypeNumber => {
  return {
    type: TypeName.Number,
    ...(valueType && value !== undefined && { [valueType]: value })
  };
};

export const isTypePositive = (node: Node): node is PrefixUnaryExpression => {
  return isPrefixUnaryExpression(node) && node.operator === SyntaxKind.PlusToken;
};

export const isTypeNegative = (node: Node): node is PrefixUnaryExpression => {
  return isPrefixUnaryExpression(node) && node.operator === SyntaxKind.MinusToken;
};

export const isTypeNumber = (node: Node) => {
  return node.kind === SyntaxKind.NumberKeyword;
};

export const isTypeLiteralNumber = (node: Node): node is NumericLiteral => {
  return node.kind === SyntaxKind.NumericLiteral;
};

export const tryTypeNumber = (node: Node, context: Context) => {
  const resolver = (current: Node, type: NumberValueType, signed?: boolean) => {
    if (isTypeNegative(current)) {
      return resolver(current.operand, type, true);
    }

    if (isTypePositive(current)) {
      return resolver(current.operand, type, false);
    }

    if (isLiteralTypeNode(current)) {
      return resolver(current.literal, 'literal', signed);
    }

    if (isTypeNumber(current)) {
      return createNumber();
    }

    if (isTypeLiteralNumber(current)) {
      const value = signed ? -Number(current.text) : Number(current.text);
      return createNumber(type, value);
    }

    return null;
  };

  const result = resolver(node, 'default');
  const event = context.events.onTypeNumber;

  if (result && event) {
    return event(result);
  }

  return result;
};
