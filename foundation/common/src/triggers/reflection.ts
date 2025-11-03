import type { TypeObject } from '@ez4/reflection';

import { createRichType, getRichTypes } from '../richtypes/utils';

const libraryFiles = ['environment', 'service'];
const libraryPath = new RegExp(`dist/richtypes/(${libraryFiles.join('|')}).d.ts`);

export const applyRichTypePath = (file: string) => {
  if (libraryPath.test(file)) {
    return file.replace(libraryPath, (_, module) => `lib/${module}.ts`);
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
