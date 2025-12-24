import type { EnumDeclaration, Node } from 'typescript';
import type { TypeEnum, EnumMember, TypePosition } from '../types';
import type { Context } from './common';

import { isEnumDeclaration } from 'typescript';

import { getNodeFilePosition, getNodeFilePath } from '../helpers/node';
import { getNodeDocumentation } from '../helpers/documentation';
import { getPathModule } from '../utils/module';
import { TypeName } from '../types';
import { tryEnumMembers } from './enum-member';

export type EnumNodes = EnumDeclaration;

export const createEnum = (
  name: string,
  file: string | undefined,
  position: TypePosition | undefined,
  description: string | undefined,
  members?: EnumMember[]
): TypeEnum => {
  const module = file && getPathModule(file);

  return {
    type: TypeName.Enum,
    name,
    ...(file && { file }),
    ...(position && { position }),
    ...(module && { module }),
    ...(description && { description }),
    ...(members?.length && { members })
  };
};

export const isTypeEnum = (node: Node): node is EnumNodes => {
  return isEnumDeclaration(node);
};

export const tryTypeEnum = (node: Node, context: Context) => {
  if (context.options.ignoreEnum || !isTypeEnum(node)) {
    return undefined;
  }

  if (context.cache.has(node)) {
    return context.cache.get(node) as TypeEnum;
  }

  const name = node.name.getText();
  const file = context.options.includeLocation ? getNodeFilePath(node) : undefined;
  const position = context.options.includeLocation ? getNodeFilePosition(node) : undefined;
  const description = getNodeDocumentation(node.name, context.checker);

  const reflectedType = createEnum(name, file, position, description);

  context.cache.set(node, reflectedType);

  const memberTypes = tryEnumMembers(node, context);

  if (memberTypes?.length) {
    reflectedType.members = memberTypes;
  }

  return reflectedType;
};
