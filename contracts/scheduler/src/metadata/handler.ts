import type { AllType, ReflectionTypes } from '@ez4/reflection';

import { getFunctionSignature } from '@ez4/common/library';

import { IncompleteHandlerError } from '../errors/handler';
import { isTargetHandler } from './utils';
import { getCronEvent } from './event';

export const getTargetHandler = (type: AllType, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTargetHandler(type)) {
    return undefined;
  }

  const handler = getFunctionSignature(type);

  const properties = new Set<string>();

  const request = type.parameters?.[0].value;

  if (request && !getCronEvent(request, type, reflection, errorList)) {
    properties.add('request');
  }

  if (!handler || properties.size) {
    errorList.push(new IncompleteHandlerError([...properties], type.file));

    return undefined;
  }

  return handler;
};
