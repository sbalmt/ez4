import type { FunctionDeclaration, Node } from 'typescript';
import type { TypeFunction, TypeParameter, EveryType, FunctionModifiers, TypePosition } from '../types';
import type { Context, State } from './common';

import { isFunctionDeclaration } from 'typescript';

import { getNodeFilePosition, getNodeFilePath } from '../helpers/node';
import { getNodeDocumentation } from '../helpers/documentation';
import { getNodeModifiers } from '../helpers/modifier';
import { getPathModule } from '../utils/module';
import { TypeName } from '../types';
import { tryCallableParameters } from './callable-parameters';
import { tryCallableReturns } from './callable-returns';

export type FunctionNodes = FunctionDeclaration;

export const createFunction = (
  name: string,
  file: string | undefined,
  position: TypePosition | undefined,
  description: string | undefined,
  modifiers: FunctionModifiers | undefined,
  parameterTypes?: TypeParameter[] | undefined,
  returnType?: EveryType | undefined
): TypeFunction => {
  const module = file && getPathModule(file);

  return {
    type: TypeName.Function,
    name,
    ...(file && { file }),
    ...(position && { position }),
    ...(module && { module }),
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
  if (context.options.ignoreFunction || !isTypeFunction(node) || !node.name || node.typeParameters) {
    return undefined;
  }

  if (context.cache.has(node)) {
    return context.cache.get(node) as TypeFunction;
  }

  const name = node.name.getText();
  const file = context.options.includePath ? getNodeFilePath(node) : undefined;
  const position = context.options.includePath ? getNodeFilePosition(node) : undefined;
  const description = getNodeDocumentation(node.name, context.checker);
  const modifiers = getNodeModifiers(node);

  const reflectedType = createFunction(name, file, position, description, modifiers);

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
