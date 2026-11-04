import type { EnumMember, EveryMemberType, TypeCallback, TypeClass, TypeEnum, TypeFunction, TypeInterface } from '@ez4/reflection';

import { relative, resolve } from 'node:path';

type DeclarationTypes = TypeEnum | TypeClass | TypeInterface | TypeFunction | TypeCallback;

type TaggableDeclarationTypes = DeclarationTypes | EveryMemberType | EnumMember;

export const getDeclarationDescription = (type: TaggableDeclarationTypes) => {
  return getDeclarationTags(type, 'description');
};

export const getDeclarationSummary = (type: TaggableDeclarationTypes) => {
  return getDeclarationTags(type, 'summary');
};

const getDeclarationTags = (type: TaggableDeclarationTypes, tagName: string) => {
  return type.tags
    ?.filter(({ name }) => name === tagName)
    ?.map(({ text }) => text)
    ?.join('\n');
};

export const isExternalDeclaration = (type: DeclarationTypes, workspacePath?: string) => {
  if (type.file) {
    const currentDirectory = workspacePath ?? process.cwd();
    const cureentPath = resolve(currentDirectory, type.file);

    return relative(currentDirectory, cureentPath).startsWith('..');
  }

  return false;
};
