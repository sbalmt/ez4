import type { FunctionDeclaration, FunctionTypeNode, Node } from 'typescript';
import type { TypeCallback, TypeParameter, EveryType, TypePosition } from '../types';
import type { Context, State } from './common';

import { isFunctionDeclaration, isFunctionTypeNode } from 'typescript';

import { getNodeFilePosition, getNodeFilePath } from '../helpers/node';
import { getNodeDocumentation } from '../helpers/documentation';
import { getPathModule } from '../utils/module';
import { TypeName } from '../types';
import { tryCallableParameters } from './callable-parameters';
import { tryCallableReturns } from './callable-returns';

export type CallbackNodes = FunctionTypeNode | FunctionDeclaration;

export const createCallback = (
  name: string | undefined,
  file: string | undefined,
  position: TypePosition | undefined,
  description: string | undefined,
  parameterTypes?: TypeParameter[] | undefined,
  returnType?: EveryType | undefined
): TypeCallback => {
  const module = file && getPathModule(file);

  return {
    type: TypeName.Callback,
    ...(name && { name }),
    ...(file && { file }),
    ...(position && { position }),
    ...(module && { module }),
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
    return undefined;
  }

  if (context.cache.has(node)) {
    return context.cache.get(node) as TypeCallback;
  }

  const name = node.name?.getText();
  const file = context.options.includePath ? getNodeFilePath(node) : undefined;
  const position = context.options.includePath ? getNodeFilePosition(node) : undefined;
  const description = node.name && getNodeDocumentation(node.name, context.checker);

  const reflectedType = createCallback(name, file, position, description);

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
