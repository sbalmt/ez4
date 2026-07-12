import type { MethodDeclaration, MethodSignature, Node } from 'typescript';
import type { ModelMethod, TypeParameter, EveryType, MethodModifiers, TypeTag } from '../types';
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
  modifiers: MethodModifiers | undefined,
  parameterTypes: TypeParameter[] | undefined,
  returnType: EveryType | undefined,
  description?: string,
  tags?: TypeTag[]
): ModelMethod => {
  return {
    type: TypeName.Method,
    name,
    ...(description && { description }),
    ...(tags?.length && { tags }),
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

  const returnType = tryCallableReturns(node, context, state);
  const parameterTypes = tryCallableParameters(node, context, state);

  if (!parameterTypes?.length && !returnType) {
    return undefined;
  }

  const documentation = getNodeDocumentation(node.name, context.checker);
  const modifiers = getNodeModifiers(node);
  const name = node.name.getText();

  return createMethod(name, modifiers, parameterTypes, returnType, documentation?.description, documentation?.tags);
};
