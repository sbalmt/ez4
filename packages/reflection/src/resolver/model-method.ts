import type { MethodDeclaration, MethodSignature, Node } from 'typescript';
import type { ModelMethod, TypeParameter, EveryType, MethodModifiers } from '../types.js';
import type { Context, State } from './common.js';

import { isMethodDeclaration, isMethodSignature } from 'typescript';
import { TypeName } from '../types.js';
import { getNodeModifiers } from '../helpers/modifier.js';
import { getNodeDocumentation } from '../helpers/documentation.js';
import { tryCallableParameters } from './callable-parameters.js';
import { tryCallableReturns } from './callable-returns.js';

export type MethodNodes = MethodDeclaration | MethodSignature;

export const createMethod = (
  name: string,
  description: string | null,
  modifiers: MethodModifiers | null,
  parameterTypes: TypeParameter[] | null,
  returnType: EveryType | null
): ModelMethod => {
  return {
    type: TypeName.Method,
    name,
    ...(description && { description }),
    ...(modifiers && { modifiers }),
    ...(parameterTypes?.length && { parameters: parameterTypes }),
    ...(returnType && { return: returnType })
  };
};

export const isModelMethod = (node: Node): node is MethodNodes => {
  return isMethodDeclaration(node) || isMethodSignature(node);
};

export const tryModelMethod = (node: Node, context: Context, state: State) => {
  if (context.options.ignoreMethod || !isModelMethod(node) || node.typeParameters) {
    return null;
  }

  const name = node.name.getText();
  const description = getNodeDocumentation(node.name, context.checker);
  const modifiers = getNodeModifiers(node);
  const parameterTypes = tryCallableParameters(node, context, state);
  const returnType = tryCallableReturns(node, context, state);

  if (!parameterTypes?.length && !returnType) {
    return null;
  }

  return createMethod(name, description, modifiers, parameterTypes, returnType);
};
