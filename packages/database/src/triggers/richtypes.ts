import type { TypeObject } from '@ez4/reflection';

import { join } from 'node:path';

import { createRichType, getRichTypes } from '../richtypes/utils.js';

const libraryPath = new RegExp(join('dist', 'richtypes', '(schema).d.ts'));

export const applyRichTypePath = (file: string) => {
  if (libraryPath.test(file)) {
    return file.replace(libraryPath, (_, module) => join('lib', `${module}.ts`));
  }

  return null;
};

export const applyRichTypeObject = (type: TypeObject) => {
  const richTypes = getRichTypes(type);

  if (richTypes) {
    return createRichType(richTypes);
  }

  return null;
};
