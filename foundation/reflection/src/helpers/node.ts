import type { Node } from 'typescript';

import { isIdentifier, isPropertyAccessExpression } from 'typescript';

import { relative } from 'node:path';
import { hash } from 'node:crypto';

import { isTypeDeclaration } from './declaration';
import { getAccessName } from './identifier';

export const isInternalType = (node: Node, workspacePath: string) => {
  return !!getNodeFilePath(node, workspacePath)?.includes('/typescript/lib/');
};

export const getNodeFilePath = (node: Node, workspacePath?: string) => {
  const currentDirectory = workspacePath ?? process.cwd();
  const currentSource = node.getSourceFile();

  return relative(currentDirectory, currentSource.fileName);
};

export const getNodeFilePosition = (node: Node) => {
  const sourceFile = node.getSourceFile();

  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());

  return {
    line: line + 1,
    character: character + 1
  };
};

export const getNodeIdentity = (node: Node, internal?: boolean, workspacePath?: string) => {
  const sourcePath = getNodeFilePath(node, workspacePath);

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
