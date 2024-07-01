import type { FunctionDeclaration, Node } from 'typescript';
import type { TypeFunction, TypeParameter, EveryType, FunctionModifiers } from '../types.js';
import type { Context, State } from './common.js';

import { isFunctionDeclaration } from 'typescript';
import { TypeName } from '../types.js';
import { getNodeFilePath } from '../helpers/node.js';
import { getNodeModifiers } from '../helpers/modifier.js';
import { getNodeDocumentation } from '../helpers/documentation.js';
import { tryCallableParameters } from './callable-parameters.js';
import { tryCallableReturns } from './callable-returns.js';

export type FunctionNodes = FunctionDeclaration;

export const createFunction = (
  name: string,
  file: string | null,
  description: string | null,
  modifiers: FunctionModifiers | null,
  parameterTypes?: TypeParameter[] | null,
  returnType?: EveryType | null
): TypeFunction => {
  return {
    type: TypeName.Function,
    name,
    ...(file && { file }),
    ...(description && { description }),
    ...(modifiers && { modifiers }),
    ...(parameterTypes?.length && { parameters: parameterTypes }),
    ...(returnType && { return: returnType })
  };
};

export const isTypeFunction = (node: Node): node is FunctionNodes => {
  return isFunctionDeclaration(node);
};

export const tryTypeFunction = (node: Node, context: Context, state: State) => {
  if (
    context.options.ignoreFunction ||
    !isTypeFunction(node) ||
    !node.name ||
    node.typeParameters
  ) {
    return null;
  }

  if (context.cache.has(node)) {
    return context.cache.get(node) as TypeFunction;
  }

  const name = node.name.getText();
  const file = context.options.includePath ? getNodeFilePath(node) : null;
  const description = getNodeDocumentation(node.name, context.checker);
  const modifiers = getNodeModifiers(node);

  const reflectedType = createFunction(name, file, description, modifiers);

  context.cache.set(node, reflectedType);

  const parameterTypes = tryCallableParameters(node, context, state);
  const returnType = tryCallableReturns(node, context, state);

  if (parameterTypes?.length) {
    reflectedType.parameters = parameterTypes;
  }

  if (returnType) {
    reflectedType.return = returnType;
  }

  return reflectedType;
};
