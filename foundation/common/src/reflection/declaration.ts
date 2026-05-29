import type { EnumMember, EveryMemberType, TypeCallback, TypeClass, TypeEnum, TypeFunction, TypeInterface } from '@ez4/reflection';

import { relative } from 'node:path';

type DeclarationTypes = TypeEnum | TypeClass | TypeInterface | TypeFunction | TypeCallback;

type TaggableDeclarationTypes = DeclarationTypes | EveryMemberType | EnumMember;

export const isExternalDeclaration = (type: DeclarationTypes) => {
  return !!type.file && relative(process.cwd(), type.file).startsWith('..');
};

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
