import type { MethodDeclaration, MethodSignature, Node } from 'typescript';
import type { ModelMethod, TypeParameter, EveryType, MethodModifiers } from '../types';
import type { Context, State } from './common';

import { isMethodDeclaration, isMethodSignature } from 'typescript';
import { TypeName } from '../types';
import { getNodeModifiers } from '../helpers/modifier';
import { getNodeDocumentation } from '../helpers/documentation';
import { tryCallableParameters } from './callable-parameters';
import { tryCallableReturns } from './callable-returns';

export type MethodNodes = MethodDeclaration | MethodSignature;

export const createMethod = (
  name: string,
  description: string | undefined,
  modifiers: MethodModifiers | undefined,
  parameterTypes: TypeParameter[] | undefined,
  returnType: EveryType | undefined
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
    return undefined;
  }

  const name = node.name.getText();
  const description = getNodeDocumentation(node.name, context.checker);
  const modifiers = getNodeModifiers(node);
  const parameterTypes = tryCallableParameters(node, context, state);
  const returnType = tryCallableReturns(node, context, state);

  if (!parameterTypes?.length && !returnType) {
    return undefined;
  }

  return createMethod(name, description, modifiers, parameterTypes, returnType);
};
