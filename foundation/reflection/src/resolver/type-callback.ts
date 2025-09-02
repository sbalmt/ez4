import type { FunctionDeclaration, FunctionTypeNode, Node } from 'typescript';
import type { TypeCallback, TypeParameter, EveryType } from '../types';
import type { Context, State } from './common';

import { isFunctionDeclaration, isFunctionTypeNode } from 'typescript';

import { getNodeFilePath } from '../helpers/node';
import { getNodeDocumentation } from '../helpers/documentation';
import { getPathModule } from '../utils/module';
import { TypeName } from '../types';
import { tryCallableParameters } from './callable-parameters';
import { tryCallableReturns } from './callable-returns';

export type CallbackNodes = FunctionTypeNode | FunctionDeclaration;

export const createCallback = (
  name: string | undefined,
  file: string | null,
  description: string | null,
  parameterTypes?: TypeParameter[] | null,
  returnType?: EveryType | null
): TypeCallback => {
  return {
    type: TypeName.Callback,
    ...(name && { name }),
    ...(file && { file }),
    ...(file && { module: getPathModule(file) }),
    ...(description && { description }),
    ...(parameterTypes?.length && { parameters: parameterTypes }),
    ...(returnType && { return: returnType })
  };
};

export const isTypeCallback = (node: Node): node is CallbackNodes => {
  return isFunctionTypeNode(node) || isFunctionDeclaration(node);
};

export const tryTypeCallback = (node: Node, context: Context, state: State) => {
  if (context.options.ignoreCallback || !isTypeCallback(node) || node.typeParameters) {
    return null;
  }

  if (context.cache.has(node)) {
    return context.cache.get(node) as TypeCallback;
  }

  const name = node.name?.getText();
  const file = context.options.includePath ? getNodeFilePath(node) : null;
  const description = node.name ? getNodeDocumentation(node.name, context.checker) : null;

  const reflectedType = createCallback(name, file, description);

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
