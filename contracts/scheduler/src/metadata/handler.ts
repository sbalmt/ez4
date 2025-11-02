import type { Incomplete } from '@ez4/utils';
import type { AllType, SourceMap } from '@ez4/reflection';
import type { TargetHandler } from '../types/common';

import { IncompleteHandlerError } from '../errors/handler';
import { isTargetHandler } from './utils';
import { getCronEvent } from './event';

export const getTargetHandler = (type: AllType, reflection: SourceMap, errorList: Error[]) => {
  if (!isTargetHandler(type)) {
    return undefined;
  }

  const { description, module } = type;

  const handler: Incomplete<TargetHandler> = {
    ...(description && { description }),
    ...(module && { module })
  };

  const properties = new Set(['name', 'file']);

  if ((handler.name = type.name)) {
    properties.delete('name');
  }

  if ((handler.file = type.file)) {
    properties.delete('file');
  }

  const request = type.parameters?.[0].value;

  if (request && !getCronEvent(request, type, reflection, errorList)) {
    properties.add('request');
  }

  if (properties.size === 0 && isValidHandler(handler)) {
    return handler;
  }

  errorList.push(new IncompleteHandlerError([...properties], type.file));

  return undefined;
};

const isValidHandler = (type: Incomplete<TargetHandler>): type is TargetHandler => {
  return !!type.name && !!type.file;
};
