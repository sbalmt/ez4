import type { Node } from 'typescript';

import { isIdentifier, isPropertyAccessExpression } from 'typescript';
import { hash } from 'node:crypto';

import { getAccessName } from './identifier.js';
import { isTypeDeclaration } from './declaration.js';

export const isInternalType = (node: Node) => {
  const sourceNode = node.getSourceFile();
  const sourceFile = sourceNode.fileName;

  return sourceFile.includes('/typescript/lib/');
};

export const getNodeFilePath = (node: Node) => {
  return node.getSourceFile().fileName;
};

export const getNodeIdentity = (node: Node, internal?: boolean) => {
  const prefix = internal ? '' : hash('md5', getNodeFilePath(node));

  if (isIdentifier(node)) {
    return `${prefix}:${node.text}`;
  }

  if (isPropertyAccessExpression(node)) {
    return `${prefix}:${getAccessName(node)}`;
  }

  if (isTypeDeclaration(node) && node.name) {
    return `${prefix}:${node.name.getText()}`;
  }

  return `${prefix}:${node.getStart()}`;
};
