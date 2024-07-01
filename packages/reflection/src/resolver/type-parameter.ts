import type {
  Node,
  NodeArray,
  TypeAliasDeclaration,
  TypeNode,
  TypeParameterDeclaration
} from 'typescript';
import type { Context, State, TypeMap } from './common.js';

import { isTypeParameterDeclaration } from 'typescript';
import { tryTypes } from './types.js';
import { ClassNodes } from './type-class.js';
import { InterfaceNodes } from './type-interface.js';

export type NodeWithTypeParameters = ClassNodes | InterfaceNodes | TypeAliasDeclaration;

export type TypeArguments = NodeArray<TypeNode>;

export const isTypeParameter = (node: Node): node is TypeParameterDeclaration => {
  return isTypeParameterDeclaration(node);
};

export const tryTypeParameter = (node: Node, context: Context, state: State) => {
  if (!isTypeParameter(node)) {
    return null;
  }

  const name = node.name.getText();
  const type = state.types[name];

  if (!type && node.default) {
    return tryTypes(node.default, context, state);
  }

  return type;
};

export const getTypeArguments = (
  node: NodeWithTypeParameters,
  types: TypeArguments,
  context: Context,
  state: State
) => {
  const newTypes: TypeMap = {};

  node.typeParameters?.forEach((parameter, index) => {
    const type = types?.at(index);

    if (type) {
      const name = parameter.name.getText();
      const parameterType = tryTypes(type, context, state);

      newTypes[name] = parameterType;
    }
  });

  return newTypes;
};
