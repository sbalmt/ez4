import type { Node, TypeReferenceNode } from 'typescript';
import type { EveryType } from '../types';
import type { Context, State } from './common';

import { isTypeReferenceNode } from 'typescript';

import { getNodeTypeDeclaration } from '../helpers/declaration';
import { isIndexReference, tryIndexReference } from './index-reference';
import { tryInternalTypeAlias, tryTypeAlias } from './type-alias';
import { tryTypeParameter } from './type-parameter';
import { tryInternalReference } from './internal-reference';
import { tryGenericReference } from './generic-reference';
import { tryModelReference } from './model-reference';
import { tryTypes } from './types';

export const isTypeReference = (node: Node): node is TypeReferenceNode => {
  return isTypeReferenceNode(node);
};

export const tryTypeReference = (node: Node, context: Context, state: State): EveryType | undefined => {
  if (isIndexReference(node)) {
    return tryIndexReference(node, context, state);
  }

  if (!isTypeReference(node)) {
    return undefined;
  }

  const declaration = getNodeTypeDeclaration(node.typeName, context.checker);
  const types = node.typeArguments;

  if (!declaration) {
    return undefined;
  }

  return (
    tryTypeAlias(declaration, types, context, state) ||
    tryInternalTypeAlias(declaration, types, context, state) ||
    tryTypeParameter(declaration, context, state) ||
    tryInternalReference(declaration, types, context, state) ||
    tryGenericReference(declaration, types, context, state) ||
    tryModelReference(declaration, context) ||
    tryTypes(declaration, context, state)
  );
};
