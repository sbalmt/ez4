import type { AllType, ReflectionTypes, TypeCallback, TypeFunction } from '@ez4/reflection';

import { getFunctionReferences, getFunctionSignature } from '@ez4/common/library';
import { isTypeCallback, isTypeFunction } from '@ez4/reflection';

import { IncompleteHandlerError } from '../errors/handler';
import { getCronEventMetadata } from './event';

export const isTargetHandlerDeclaration = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getTargetHandlerMetadata = (type: AllType, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTargetHandlerDeclaration(type)) {
    return undefined;
  }

  const handler = getFunctionSignature(type);
  const properties = new Set<string>();

  if (type.parameters) {
    const [requestType, contextType] = type.parameters;

    if (requestType && !getCronEventMetadata(requestType.value, type, reflection, errorList)) {
      properties.add('request');
    }

    if (handler && contextType) {
      const references = getFunctionReferences(contextType);

      if (references?.length) {
        handler.references = references;
      }
    }
  }

  if (!handler || properties.size) {
    errorList.push(new IncompleteHandlerError([...properties], type.file));
    return undefined;
  }

  return handler;
};
