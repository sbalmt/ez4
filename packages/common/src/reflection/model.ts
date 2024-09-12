import type { AllType, TypeClass, TypeInterface, TypeModel } from '@ez4/reflection';
import type { MemberType } from './types.js';

import { isTypeClass, isTypeInterface } from '@ez4/reflection';

export const isInterfaceDeclaration = (type: AllType): type is TypeInterface => {
  return isTypeInterface(type);
};

export const isClassDeclaration = (type: AllType): type is TypeClass => {
  return isTypeClass(type) && !!type.modifiers?.declare;
};

export const isModelDeclaration = (type: AllType): type is TypeModel => {
  return isClassDeclaration(type) || isInterfaceDeclaration(type);
};

export const hasHeritageType = (type: TypeModel, name: string) => {
  return !!getHeritageType(type, name);
};

export const getHeritageType = (type: TypeModel, name: string) => {
  return type.heritage?.find(({ namespace, path }) => {
    const [, typeName] = path.split(':');

    if (namespace) {
      return `${namespace}.${typeName}` === name;
    }

    return typeName === name;
  });
};

export const getModelMembers = (type: TypeModel) => {
  const membersMap = new Map<string, MemberType>();

  type.heritage?.forEach((heritage) => {
    heritage.members?.forEach((member) => {
      if (!member.modifiers?.abstract) {
        membersMap.set(member.name, {
          ...member,
          inherited: true
        });
      }
    });
  });

  type.members?.forEach((member) => {
    if (!member.modifiers?.abstract) {
      membersMap.set(member.name, {
        ...member,
        inherited: false
      });
    }
  });

  return [...membersMap.values()];
};
