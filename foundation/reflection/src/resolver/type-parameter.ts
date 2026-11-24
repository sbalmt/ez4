import type { NodeArray, Node, TypeParameterDeclaration } from 'typescript';
import type { Context, State } from './common';

import { isTypeParameterDeclaration } from 'typescript';

import { createUnknown } from './type-unknown';
import { tryTypes } from './types';

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

export const getTypeParameters = (parameters: NodeArray<TypeParameterDeclaration>, context: Context, state: State) => {
  const newState = { ...state, types: { ...state.types } };

  parameters.forEach((parameter) => {
    const name = parameter.name.getText();
    const source = parameter.default ?? parameter.constraint;
    const type = source && tryTypes(source, context, newState);

    newState.types[name] = type ?? createUnknown();
  });

  return newState;
};
