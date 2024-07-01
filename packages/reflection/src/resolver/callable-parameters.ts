import type { Node, ParameterDeclaration } from 'typescript';
import type { TypeParameter, EveryType } from '../types.js';
import type { CallbackNodes } from './type-callback.js';
import type { FunctionNodes } from './type-function.js';
import type { MethodNodes } from './model-method.js';
import type { Context, State } from './common.js';

import { isParameter } from 'typescript';
import { getNodeDocumentation } from '../helpers/documentation.js';
import { isOptional } from '../utils.js';
import { isTypeUnion, TypeName } from '../types.js';
import { createUnion } from './type-union.js';
import { createUndefined } from './type-undefined.js';
import { getNewState } from './common.js';
import { tryTypes } from './types.js';

export type NodeWithParameters = MethodNodes | CallbackNodes | FunctionNodes;

export const createParameter = (
  name: string,
  value: EveryType,
  description?: string | null
): TypeParameter => {
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

export const tryCallableParameters = (
  nodes: NodeWithParameters,
  context: Context,
  state: State
) => {
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
