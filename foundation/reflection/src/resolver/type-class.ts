import type { ClassDeclaration, Node } from 'typescript';
import type { ClassModifiers, EveryMemberType, ModelHeritage, TypeClass, TypePosition } from '../types';
import type { Context, State } from './common';

import { isClassDeclaration } from 'typescript';

import { getNodeFilePosition, getNodeFilePath } from '../helpers/node';
import { getNodeDocumentation } from '../helpers/documentation';
import { getNodeModifiers } from '../helpers/modifier';
import { getPathModule } from '../utils/module';
import { TypeName } from '../types';
import { tryModelHeritage } from './model-heritage';
import { tryModelMembers } from './model-members';

export type ClassNodes = ClassDeclaration;

export const createClass = (
  name: string,
  file: string | undefined,
  position: TypePosition | undefined,
  description: string | undefined,
  modifiers: ClassModifiers | undefined,
  heritage?: ModelHeritage[],
  members?: EveryMemberType[]
): TypeClass => {
  const module = file && getPathModule(file);

  return {
    type: TypeName.Class,
    name,
    ...(file && { file }),
    ...(position && { position }),
    ...(module && { module }),
    ...(description && { description }),
    ...(modifiers && { modifiers }),
    ...(heritage?.length && { heritage }),
    ...(members?.length && { members })
  };
};

export const isTypeClass = (node: Node): node is ClassNodes => {
  return isClassDeclaration(node);
};

export const tryTypeClass = (node: Node, context: Context, state: State) => {
  if (context.options.ignoreClass || !isTypeClass(node) || !node.name) {
    return undefined;
  }

  if (context.cache.has(node)) {
    return context.cache.get(node) as TypeClass;
  }

  const name = node.name.getText();
  const file = context.options.includeLocation ? getNodeFilePath(node) : undefined;
  const position = context.options.includeLocation ? getNodeFilePosition(node) : undefined;
  const description = getNodeDocumentation(node.name, context.checker);
  const modifiers = getNodeModifiers(node);

  const reflectedType = createClass(name, file, position, description, modifiers);

  context.cache.set(node, reflectedType);

  const heritageTypes = tryModelHeritage(node, context, state);
  const memberTypes = tryModelMembers(node, context, state);

  if (heritageTypes.length) {
    reflectedType.heritage = heritageTypes;
  }

  if (memberTypes.length) {
    reflectedType.members = memberTypes;
  }

  return reflectedType;
};
