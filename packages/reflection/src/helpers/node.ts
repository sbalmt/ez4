import type { Node } from 'typescript';

import { isIdentifier, isPropertyAccessExpression } from 'typescript';
import { hash } from 'node:crypto';

import { getAccessName } from './identifier.js';
import { isTypeDeclaration } from './declaration.js';

export const isInternalType = (node: Node) => {
  return !!getNodeFilePath(node)?.includes('/typescript/lib/');
};

export const getNodeFilePath = (node: Node): string | null => {
  return node.getSourceFile()?.fileName ?? null;
};

export const getNodeIdentity = (node: Node, internal?: boolean) => {
  const sourcePath = getNodeFilePath(node);

  if (!sourcePath) {
    throw new Error(`Source path for node wasn't set.`);
  }

  const prefix = internal ? '' : hash('md5', sourcePath);

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
