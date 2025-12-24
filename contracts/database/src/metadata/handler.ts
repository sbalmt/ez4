import type { AllType, ReflectionTypes } from '@ez4/reflection';

import { getFunctionSignature } from '@ez4/common/library';

import { IncompleteHandlerError } from '../errors/handler';
import { isStreamHandler } from './utils';

export const getStreamHandler = (type: AllType, _reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isStreamHandler(type)) {
    return undefined;
  }

  const handler = getFunctionSignature(type);

  const properties = new Set(['change']);

  if (type.parameters) {
    properties.delete('change');
  }

  if (!handler || properties.size) {
    errorList.push(new IncompleteHandlerError([...properties], type.file));

    return undefined;
  }

  return handler;
};
