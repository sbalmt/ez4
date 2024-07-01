import type { Node, TypeReferenceNode } from 'typescript';
import type { EveryType } from '../types.js';
import type { Context, State } from './common.js';

import { isTypeReferenceNode } from 'typescript';

import { getNodeTypeDeclaration } from '../helpers/declaration.js';
import { tryTypeCallback } from './type-callback.js';
import { tryTypeAlias } from './type-alias.js';
import { tryGenericReference } from './generic-reference.js';
import { tryTypeParameter } from './type-parameter.js';
import { tryInternalReference } from './internal-reference.js';
import { tryModelReference } from './model-reference.js';
import { tryTypeObject } from './type-object.js';
import { tryEnumReference } from './enum-reference.js';

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
    (types && tryInternalReference(declaration, types, context, state)) ||
    (types && tryGenericReference(declaration, types, context, state)) ||
    tryModelReference(declaration, context) ||
    tryTypeCallback(declaration, context, state) ||
    tryTypeObject(declaration, context, state) ||
    tryEnumReference(declaration, context)
  );
};
