import type { Node, TypeChecker } from 'typescript';

import {
  isComputedPropertyName,
  isIdentifier,
  isPropertyAccessExpression,
  isStringLiteral
} from 'typescript';

export const getPropertyName = (node: Node, checker: TypeChecker): string => {
  if (isStringLiteral(node)) {
    return node.text;
  }

  if (isComputedPropertyName(node)) {
    const type = checker.getTypeAtLocation(node.expression);

    if (type.isNumberLiteral()) {
      return type.value.toString();
    }

    if (type.isStringLiteral()) {
      return type.value;
    }

    return node.expression.getText();
  }

  return node.getText();
};

const getAccessPath = (current: Node): string => {
  if (isPropertyAccessExpression(current)) {
    return `${getAccessPath(current.expression)}.${getAccessPath(current.name)}`;
  }

  if (isIdentifier(current)) {
    return current.text;
  }

  return current.getText();
};

export const getAccessName = (node: Node): string => {
  if (isPropertyAccessExpression(node)) {
    return getAccessName(node.name);
  }

  if (isIdentifier(node)) {
    return node.text;
  }

  return node.getText();
};

export const getAccessNamespace = (node: Node): string | null => {
  if (isPropertyAccessExpression(node)) {
    return getAccessPath(node.expression);
  }

  return null;
};
