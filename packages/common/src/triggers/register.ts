import type { TypeObject } from '@ez4/reflection';

import { join } from 'node:path';

import { createTrigger } from '@ez4/project/library';

import { createRichType, getRichTypes } from '../richtypes/utils.js';

const libraryPath = new RegExp(join('dist', 'richtypes', '(environment).d.ts'));

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  createTrigger('@ez4/project', {
    'reflection:loadFile': applyRichTypePath,
    'reflection:typeObject': applyRichTypeObject
  });

  isRegistered = true;
};

const applyRichTypePath = (file: string) => {
  if (libraryPath.test(file)) {
    return file.replace(libraryPath, (_, module) => join('lib', `${module}.ts`));
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
