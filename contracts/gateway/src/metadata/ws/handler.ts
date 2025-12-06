import type { AllType, TypeCallback, TypeFunction } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { WsHandler } from './types';

import { isTypeCallback, isTypeFunction } from '@ez4/reflection';
import { IncompleteHandlerError } from '../../errors/handler';

export const isWsHandlerDeclaration = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getWsHandler = (type: AllType, errorList: Error[]) => {
  if (!isWsHandlerDeclaration(type)) {
    return undefined;
  }

  const { description, module } = type;

  const handler: Incomplete<WsHandler> = {
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

  if (properties.size === 0 && isCompleteWsHandler(handler)) {
    return handler;
  }

  errorList.push(new IncompleteHandlerError([...properties], type.file));

  return undefined;
};

const isCompleteWsHandler = (type: Incomplete<WsHandler>): type is WsHandler => {
  return !!type.name && !!type.file;
};
