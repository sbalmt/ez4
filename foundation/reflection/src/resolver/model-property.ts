import type { Node, PropertyDeclaration, PropertySignature } from 'typescript';
import type { ModelProperty, EveryType, PropertyModifiers, TypeTag } from '../types';
import type { Context, State } from './common';

import { isPropertyDeclaration, isPropertySignature } from 'typescript';

import { isTypeUnion, TypeName } from '../types';
import { isOptional } from '../utils';
import { getNodeModifiers } from '../helpers/modifier';
import { getPropertyName } from '../helpers/identifier';
import { getNodeDocumentation } from '../helpers/documentation';
import { createUnion } from './type-union';
import { createUndefined } from './type-undefined';
import { getNewState } from './common';
import { tryTypes } from './types';

export type PropertyNodes = PropertySignature | PropertyDeclaration;

export const createProperty = (
  name: string,
  value: EveryType,
  modifiers?: PropertyModifiers,
  description?: string,
  tags?: TypeTag[]
): ModelProperty => {
  return {
    type: TypeName.Property,
    name,
    ...(description && { description }),
    ...(tags?.length && { tags }),
    ...(modifiers && { modifiers }),
    value
  };
};

export const isModelProperty = (node: Node): node is PropertyNodes => {
  return isPropertySignature(node) || isPropertyDeclaration(node);
};

export const tryModelProperty = (node: Node, context: Context, state: State) => {
  if (!isModelProperty(node) || !node.type) {
    return undefined;
  }

  const newState = getNewState({ types: state.types });
  const valueType = tryTypes(node.type, context, newState);

  if (!valueType) {
    return undefined;
  }

  const name = getPropertyName(node.name, context.checker);
  const documentation = getNodeDocumentation(node.name, context.checker);
  const modifiers = getNodeModifiers(node);

  if (!node.questionToken || isOptional(valueType)) {
    return createProperty(name, valueType, modifiers, documentation?.description, documentation?.tags);
  }

  const unionType = isTypeUnion(valueType) ? valueType : createUnion([valueType]);

  unionType.elements.push(createUndefined());

  return createProperty(name, unionType, modifiers, documentation?.description, documentation?.tags);
};
