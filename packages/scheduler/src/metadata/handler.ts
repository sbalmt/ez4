import type { Incomplete } from '@ez4/utils';
import type { AllType, SourceMap } from '@ez4/reflection';
import type { TargetHandler } from '../types/common.js';

import { IncompleteHandlerError } from '../errors/handler.js';
import { isTargetHandler } from './utils.js';
import { getCronEvent } from './event.js';

export const getTargetHandler = (type: AllType, reflection: SourceMap, errorList: Error[]) => {
  if (!isTargetHandler(type)) {
    return null;
  }

  const handler: Incomplete<TargetHandler> = {};
  const properties = new Set(['name', 'file']);

  if (type.description) {
    handler.description = type.description;
  }

  if ((handler.name = type.name)) {
    properties.delete('name');
  }

  if ((handler.file = type.file)) {
    properties.delete('file');
  }

  const eventRequest = type.parameters?.[0];

  if (eventRequest) {
    handler.input = eventRequest.name;

    if (!getCronEvent(eventRequest.value, type, reflection, errorList)) {
      errorList.push(new IncompleteHandlerError([eventRequest.name], type.file));

      return null;
    }
  }

  if (properties.size === 0 && isValidHandler(handler)) {
    return handler;
  }

  errorList.push(new IncompleteHandlerError([...properties], type.file));

  return null;
};

const isValidHandler = (type: Incomplete<TargetHandler>): type is TargetHandler => {
  return !!type.name && !!type.file;
};
