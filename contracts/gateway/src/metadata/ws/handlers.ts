import type { AllType, TypeCallback, TypeFunction, TypeModel, SourceMap } from '@ez4/reflection';
import { isObjectWith, type Incomplete } from '@ez4/utils';
import type { WsHandler } from './types';

import { isTypeCallback, isTypeFunction } from '@ez4/reflection';

import { IncompleteHandlerError } from '../../errors/http/handler';
import { getWsResponse } from './response';
import { getWsRequest } from './request';

export const isWsHandlerDeclaration = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getWsMessageHandler = (type: AllType, errorList: Error[]) => {
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

export const getWsConnectHandler = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isWsHandlerDeclaration(type)) {
    return undefined;
  }

  const { description, module } = type;

  const handler: Incomplete<WsHandler> = {
    ...(description && { description }),
    ...(module && { module })
  };

  const properties = new Set(['name', 'file', 'response']);

  if ((handler.name = type.name)) {
    properties.delete('name');
  }

  if ((handler.file = type.file)) {
    properties.delete('file');
  }

  if (type.parameters) {
    const [{ value: requestType }] = type.parameters;

    handler.request = getWsRequest(requestType, parent, reflection, errorList);
  }

  if (type.return) {
    const response = getWsResponse(type.return, parent, reflection, errorList);

    if (response) {
      handler.response = response;
      properties.delete('response');
    }
  }

  if (isCompleteWsHandler(handler)) {
    return handler;
  }

  errorList.push(new IncompleteHandlerError([...properties], type.file));

  return undefined;
};

const isCompleteWsHandler = (type: Incomplete<WsHandler>): type is WsHandler => {
  return isObjectWith(type, ['name', 'file']);
};
