import type { Node, NodeArray, TypeAliasDeclaration, TypeNode, TypeParameterDeclaration } from 'typescript';
import type { Context, State, TypeMap } from './common';
import type { InterfaceNodes } from './type-interface';
import type { ClassNodes } from './type-class';

import { isTypeParameterDeclaration } from 'typescript';

import { tryTypes } from './types';

export type NodeWithTypeParameters = ClassNodes | InterfaceNodes | TypeAliasDeclaration;

export type TypeArguments = NodeArray<TypeNode>;

export const isTypeParameter = (node: Node): node is TypeParameterDeclaration => {
  return isTypeParameterDeclaration(node);
};

export const tryTypeParameter = (node: Node, context: Context, state: State) => {
  if (!isTypeParameter(node)) {
    return undefined;
  }

  const name = node.name.getText();
  const type = state.types[name];

  if (!type && node.default) {
    return tryTypes(node.default, context, state);
  }

  return type;
};

export const getTypeArguments = (node: NodeWithTypeParameters, types: TypeArguments, context: Context, state: State) => {
  const newTypes: TypeMap = {};

  node.typeParameters?.forEach((parameter, index) => {
    const type = types?.at(index);

    if (type) {
      const parameterName = parameter.name.getText();
      const parameterType = tryTypes(type, context, state);

      newTypes[parameterName] = parameterType;
    }
  });

  return newTypes;
};
