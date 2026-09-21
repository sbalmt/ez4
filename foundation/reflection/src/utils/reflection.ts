import type { ReflectionFileListener } from '../compiler';
import type { AllType, ReflectionTypes } from '../types';

import { TypeName } from '../types';

export const getReflectionFileNames = (reflection: ReflectionTypes, onReflectionFile?: ReflectionFileListener) => {
  const fileNames = new Set<string>();

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (declaration.file && (!onReflectionFile || onReflectionFile(declaration))) {
      groupDeclarationFiles(declaration, fileNames);

      fileNames.add(declaration.file);
    }
  }

  return [...fileNames];
};

const groupDeclarationFiles = (declaration: AllType, fileNames = new Set<string>()) => {
  switch (declaration.type) {
    case TypeName.Enum:
    case TypeName.Function:
      if (declaration.file) {
        fileNames.add(declaration.file);
      }
      break;

    case TypeName.Object:
      if (Array.isArray(declaration.members)) {
        declaration.members.forEach((member) => {
          groupDeclarationFiles(member, fileNames);
        });
      }
      break;

    case TypeName.Class:
    case TypeName.Interface:
      declaration.members?.forEach((member) => {
        groupDeclarationFiles(member, fileNames);
      });
      break;
  }

  return fileNames;
};
