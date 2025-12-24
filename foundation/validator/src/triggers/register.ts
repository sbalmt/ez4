import { tryCreateTrigger } from '@ez4/project/library';

const libraryFiles = ['validator'];
const libraryPath = new RegExp(`dist/richtypes/(${libraryFiles.join('|')}).d.ts`);

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  tryCreateTrigger('@ez4/validator', {
    'reflection:loadFile': applyRichTypePath
  });

  isRegistered = true;
};

const applyRichTypePath = (file: string) => {
  if (libraryPath.test(file)) {
    return file.replace(libraryPath, (_, module) => `lib/${module}.ts`);
  }

  return null;
};
