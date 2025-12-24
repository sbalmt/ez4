import type { Node } from 'typescript';

import { isIdentifier, isPropertyAccessExpression } from 'typescript';

import { relative } from 'node:path';
import { hash } from 'node:crypto';

import { isTypeDeclaration } from './declaration';
import { getAccessName } from './identifier';

export const isInternalType = (node: Node) => {
  return !!getNodeFilePath(node)?.includes('/typescript/lib/');
};

export const getNodeFilePath = (node: Node) => {
  const sourceFile = node.getSourceFile();

  const basePath = process.cwd();
  const filePath = sourceFile.fileName;

  return relative(basePath, filePath);
};

export const getNodeFilePosition = (node: Node) => {
  const sourceFile = node.getSourceFile();

  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());

  return {
    line: line + 1,
    character: character + 1
  };
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

  return `${prefix}:${node.pos}`;
};
