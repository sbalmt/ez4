import type { FunctionDeclaration, FunctionTypeNode, Node } from 'typescript';
import type { TypeCallback, TypeParameter, EveryType, TypePosition, TypeTag } from '../types';
import type { Context, State } from './common';

import { isFunctionDeclaration, isFunctionTypeNode } from 'typescript';

import { getNodeDocumentation } from '../helpers/documentation';
import { getNodeFilePosition, getNodeFilePath } from '../helpers/node';
import { getPathModule } from '../utils/module';
import { TypeName } from '../types';
import { tryCallableParameters } from './callable-parameters';
import { tryCallableReturns } from './callable-returns';
import { getTypeParameters } from './type-parameter';

export type CallbackNodes = FunctionTypeNode | FunctionDeclaration;

export const createCallback = (
  name: string | undefined,
  file: string | undefined,
  position: TypePosition | undefined,
  description?: string,
  tags?: TypeTag[],
  parameterTypes?: TypeParameter[],
  returnType?: EveryType
): TypeCallback => {
  const module = file && getPathModule(file);

  return {
    type: TypeName.Callback,
    ...(name && { name }),
    ...(file && { file }),
    ...(position && { position }),
    ...(module && { module }),
    ...(description && { description }),
    ...(tags?.length && { tags }),
    ...(parameterTypes?.length && { parameters: parameterTypes }),
    ...(returnType && { return: returnType })
  };
};

export const isTypeCallback = (node: Node): node is CallbackNodes => {
  return isFunctionTypeNode(node) || isFunctionDeclaration(node);
};

export const tryTypeCallback = (node: Node, context: Context, state: State) => {
  if (context.options.ignoreCallback || !isTypeCallback(node)) {
    return undefined;
  }

  if (context.cache.has(node)) {
    return context.cache.get(node) as TypeCallback;
  }

  const name = node.name?.getText();
  const file = context.options.includeLocation ? getNodeFilePath(node, context.workspacePath) : undefined;
  const position = context.options.includeLocation ? getNodeFilePosition(node) : undefined;
  const documentation = node.name && getNodeDocumentation(node.name, context.checker);

  const reflectedType = createCallback(name, file, position, documentation?.description, documentation?.tags);

  context.cache.set(node, reflectedType);

  const callableState = node.typeParameters ? getTypeParameters(node.typeParameters, context, state) : state;
  const parameterTypes = tryCallableParameters(node, context, callableState);
  const returnType = tryCallableReturns(node, context, callableState);

  if (parameterTypes?.length) {
    reflectedType.parameters = parameterTypes;
  }

  if (returnType) {
    reflectedType.return = returnType;
  }

  return reflectedType;
};
