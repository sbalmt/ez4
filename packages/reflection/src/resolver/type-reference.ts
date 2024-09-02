import type { Node, TypeReferenceNode } from 'typescript';
import type { EveryType } from '../types.js';
import type { Context, State } from './common.js';

import { isTypeReferenceNode } from 'typescript';

import { getNodeTypeDeclaration } from '../helpers/declaration.js';
import { tryTypeAlias } from './type-alias.js';
import { tryTypeParameter } from './type-parameter.js';
import { tryInternalReference } from './internal-reference.js';
import { tryGenericReference } from './generic-reference.js';
import { tryModelReference } from './model-reference.js';
import { tryTypes } from './types.js';

export const isTypeReference = (node: Node): node is TypeReferenceNode => {
  return isTypeReferenceNode(node);
};

export const tryTypeReference = (node: Node, context: Context, state: State): EveryType | null => {
  if (!isTypeReference(node)) {
    return null;
  }

  const declaration = getNodeTypeDeclaration(node.typeName, context.checker);
  const types = node.typeArguments;

  if (!declaration) {
    return null;
  }

  return (
    tryTypeAlias(declaration, types, context, state) ||
    tryTypeParameter(declaration, context, state) ||
    tryInternalReference(declaration, types, context, state) ||
    tryGenericReference(declaration, types, context, state) ||
    tryModelReference(declaration, context) ||
    tryTypes(declaration, context, state)
  );
};
