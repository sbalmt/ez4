import type { Node, PropertyDeclaration, PropertySignature } from 'typescript';
import type { ModelProperty, EveryType, PropertyModifiers } from '../types.js';
import type { Context, State } from './common.js';

import { isPropertyDeclaration, isPropertySignature } from 'typescript';

import { isTypeUnion, TypeName } from '../types.js';
import { isOptional } from '../utils.js';
import { getNodeModifiers } from '../helpers/modifier.js';
import { getPropertyName } from '../helpers/identifier.js';
import { getNodeDocumentation } from '../helpers/documentation.js';
import { createUnion } from './type-union.js';
import { createUndefined } from './type-undefined.js';
import { getNewState } from './common.js';
import { tryTypes } from './types.js';

export type PropertyNodes = PropertySignature | PropertyDeclaration;

export const createProperty = (
  name: string,
  value: EveryType,
  description?: string | null,
  modifiers?: PropertyModifiers | null
): ModelProperty => {
  return {
    type: TypeName.Property,
    name,
    ...(description && { description }),
    ...(modifiers && { modifiers }),
    value
  };
};

export const isModelProperty = (node: Node): node is PropertyNodes => {
  return isPropertySignature(node) || isPropertyDeclaration(node);
};

export const tryModelProperty = (node: Node, context: Context, state: State) => {
  if (!isModelProperty(node) || !node.type) {
    return null;
  }

  const newState = getNewState({ types: state.types });
  const valueType = tryTypes(node.type, context, newState);

  if (!valueType) {
    return null;
  }

  const name = getPropertyName(node.name, context.checker);
  const description = getNodeDocumentation(node.name, context.checker);
  const modifiers = getNodeModifiers(node);

  if (!node.questionToken || isOptional(valueType)) {
    return createProperty(name, valueType, description, modifiers);
  }

  const unionType = isTypeUnion(valueType) ? valueType : createUnion([valueType]);

  unionType.elements.push(createUndefined());

  return createProperty(name, unionType, description, modifiers);
};
