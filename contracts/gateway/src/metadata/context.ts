import type { AllType, SourceMap, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { HttpContext } from '../types/common';

import { isModelDeclaration, getModelMembers, getReferenceType, getLinkedServiceList } from '@ez4/common/library';
import { isModelProperty, isTypeReference } from '@ez4/reflection';

import { IncompleteContextError, InvalidContextTypeError } from '../errors/context';

export const getHttpContext = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getContextType(type, parent, reflection, errorList, 'Http.Provider');
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getContextType(declaration, parent, reflection, errorList, 'Http.Provider');
  }

  return null;
};

const isValidContext = (type: Incomplete<HttpContext>): type is HttpContext => {
  return !!type.services;
};

const getContextType = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[], baseType: string) => {
  if (!isModelDeclaration(type)) {
    console.dir(type, { depth: null });
    errorList.push(new InvalidContextTypeError(baseType, parent.file));
    return null;
  }

  return getTypeFromMembers(type, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel | TypeIntersection,
  members: MemberType[],
  reflection: SourceMap,
  errorList: Error[]
) => {
  const context: HttpContext = {};
  const properties = new Set(['services']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      case 'services':
        const services = getLinkedServiceList(member, reflection, errorList);

        if (services) {
          context.services = services;
        }

        properties.delete(member.name);
        break;
    }
  }

  if (isValidContext(context)) {
    return context;
  }

  errorList.push(new IncompleteContextError([...properties], type.file));

  return null;
};
