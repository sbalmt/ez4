import type { Incomplete } from '@ez4/utils';
import type { AllType, SourceMap } from '@ez4/reflection';
import type { StreamHandler } from '../types/handler.js';

import { IncompleteHandlerError } from '../errors/handler.js';
import { isStreamHandler } from './utils.js';

export const getStreamHandler = (type: AllType, _reflection: SourceMap, errorList: Error[]) => {
  if (!isStreamHandler(type)) {
    return null;
  }

  const { description, module } = type;

  const handler: Incomplete<StreamHandler> = {
    ...(description && { description }),
    ...(module && { module })
  };

  const properties = new Set(['name', 'file', 'change']);

  if ((handler.name = type.name)) {
    properties.delete('name');
  }

  if ((handler.file = type.file)) {
    properties.delete('file');
  }

  if (type.parameters) {
    properties.delete('change');
  }

  if (properties.size === 0 && isValidHandler(handler)) {
    return handler;
  }

  errorList.push(new IncompleteHandlerError([...properties], type.file));

  return null;
};

const isValidHandler = (type: Incomplete<StreamHandler>): type is StreamHandler => {
  return !!type.name && !!type.file;
};
