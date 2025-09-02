import type { InterfaceDeclaration, Node } from 'typescript';
import type { Context, State } from './common';

import type { EveryMemberType, InterfaceModifiers, ModelHeritage, TypeInterface } from '../types';

import { isInterfaceDeclaration } from 'typescript';
import { getNodeFilePath } from '../helpers/node';
import { getNodeDocumentation } from '../helpers/documentation';
import { getNodeModifiers } from '../helpers/modifier';
import { getPathModule } from '../utils/module';
import { TypeName } from '../types';
import { tryModelHeritage } from './model-heritage';
import { tryModelMembers } from './model-members';

export type InterfaceNodes = InterfaceDeclaration;

export const createInterface = (
  name: string,
  file: string | null,
  description: string | null,
  modifiers: InterfaceModifiers | null,
  heritage?: ModelHeritage[],
  members?: EveryMemberType[]
): TypeInterface => {
  return {
    type: TypeName.Interface,
    name,
    ...(file && { file }),
    ...(file && { module: getPathModule(file) }),
    ...(description && { description }),
    ...(modifiers && { modifiers }),
    ...(heritage?.length && { heritage }),
    ...(members?.length && { members })
  };
};

export const isTypeInterface = (node: Node): node is InterfaceNodes => {
  return isInterfaceDeclaration(node);
};

export const tryTypeInterface = (node: Node, context: Context, state: State) => {
  if (context.options.ignoreInterface || !isTypeInterface(node)) {
    return null;
  }

  if (context.cache.has(node)) {
    return context.cache.get(node) as TypeInterface;
  }

  const name = node.name.getText();
  const file = context.options.includePath ? getNodeFilePath(node) : null;
  const description = getNodeDocumentation(node.name, context.checker);
  const modifiers = getNodeModifiers(node);

  const reflectedType = createInterface(name, file, description, modifiers);

  context.cache.set(node, reflectedType);

  const heritageTypes = tryModelHeritage(node, context, state);
  const memberTypes = tryModelMembers(node, context, state);

  if (heritageTypes?.length) {
    reflectedType.heritage = heritageTypes;
  }

  if (memberTypes?.length) {
    reflectedType.members = memberTypes;
  }

  return reflectedType;
};
