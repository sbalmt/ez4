import type { Node, ParameterDeclaration } from 'typescript';
import type { TypeParameter, EveryType } from '../types';
import type { CallbackNodes } from './type-callback';
import type { FunctionNodes } from './type-function';
import type { MethodNodes } from './model-method';
import type { Context, State } from './common';

import { isParameter } from 'typescript';
import { getNodeDocumentation } from '../helpers/documentation';
import { isOptional } from '../utils';
import { isTypeUnion, TypeName } from '../types';
import { createUnion } from './type-union';
import { createUndefined } from './type-undefined';
import { getNewState } from './common';
import { tryTypes } from './types';

export type NodeWithParameters = MethodNodes | CallbackNodes | FunctionNodes;

export const createParameter = (name: string, value: EveryType, description?: string | null): TypeParameter => {
  return {
    type: TypeName.Parameter,
    name,
    ...(description && { description }),
    value
  };
};

export const isTypeParameter = (node: Node): node is ParameterDeclaration => {
  return isParameter(node);
};

export const tryCallableParameter = (node: Node, context: Context, state: State) => {
  if (!isTypeParameter(node)) {
    return null;
  }

  const resolver = () => {
    const spread = !!node.dotDotDotToken;
    const newState = { ...state, spread };

    if (node.type) {
      return tryTypes(node.type, context, newState);
    }

    if (node.initializer) {
      return tryTypes(node.initializer, context, newState);
    }

    return null;
  };

  const valueType = resolver();

  if (!valueType) {
    return null;
  }

  const name = node.name.getText();
  const description = getNodeDocumentation(node.name, context.checker);

  if (!node.questionToken || isOptional(valueType)) {
    return createParameter(name, valueType, description);
  }

  const unionType = isTypeUnion(valueType) ? valueType : createUnion([valueType]);

  unionType.elements.push(createUndefined());

  return createParameter(name, unionType, description);
};

export const tryCallableParameters = (nodes: NodeWithParameters, context: Context, state: State) => {
  if (context.options.ignoreParameters) {
    return null;
  }

  const newState = getNewState({ types: state.types });
  const parameterList: TypeParameter[] = [];

  nodes.parameters.forEach((node) => {
    const result = tryCallableParameter(node, context, newState);

    if (result) {
      parameterList.push(result);
    }
  });

  return parameterList;
};
