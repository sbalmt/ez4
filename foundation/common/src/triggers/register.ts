import type { TypeObject } from '@ez4/reflection';

import { createTrigger } from '@ez4/project/library';

import { createRichType, getRichTypes } from '../richtypes/utils.js';

const libraryFiles = ['environment'];
const libraryPath = new RegExp(`dist/richtypes/(${libraryFiles.join('|')}).d.ts`);

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  createTrigger('@ez4/common', {
    'reflection:loadFile': applyRichTypePath,
    'reflection:typeObject': applyRichTypeObject
  });

  isRegistered = true;
};

const applyRichTypePath = (file: string) => {
  if (libraryPath.test(file)) {
    return file.replace(libraryPath, (_, module) => `lib/${module}.ts`);
  }

  return null;
};

const applyRichTypeObject = (type: TypeObject) => {
  const richTypes = getRichTypes(type);

  if (richTypes) {
    return createRichType(richTypes);
  }

  return null;
};
