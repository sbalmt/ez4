import type { TypeCallback, TypeClass, TypeEnum, TypeFunction, TypeInterface } from '@ez4/reflection';

import { relative } from 'node:path';

type DeclarationTypes = TypeEnum | TypeClass | TypeInterface | TypeFunction | TypeCallback;

export const isExternalDeclaration = (type: DeclarationTypes) => {
  return !!type.file && relative(process.cwd(), type.file).startsWith('..');
};

export const getDeclarationDescription = (type: DeclarationTypes) => {
  return type.tags?.find(({ name }) => name === 'description')?.text;
};

export const getDeclarationSummary = (type: DeclarationTypes) => {
  return type.tags?.find(({ name }) => name === 'summary')?.text;
};
