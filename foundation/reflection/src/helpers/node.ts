import type { Node } from 'typescript';

import { isIdentifier, isPropertyAccessExpression } from 'typescript';

import { relative } from 'node:path';
import { hash } from 'node:crypto';

import { getAccessName } from './identifier';
import { isTypeDeclaration } from './declaration';

export const isInternalType = (node: Node) => {
  return !!getNodeFilePath(node)?.includes('/typescript/lib/');
};

export const getNodeFilePath = (node: Node): string | null => {
  const sourceFile = node.getSourceFile();

  if (!sourceFile) {
    return null;
  }

  const basePath = process.cwd();
  const filePath = sourceFile.fileName;

  return relative(basePath, filePath);
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
