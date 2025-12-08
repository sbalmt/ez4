import type { AllType, TypeCallback, TypeFunction, TypeModel, SourceMap, EveryType } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { WsEvent, WsHandler, WsRequest } from './types';

import { isTypeCallback, isTypeFunction } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteHandlerError } from '../../errors/http/handler';
import { getWsResponse } from './response';
import { getWsEvent } from './event';
import { getWsRequest } from './request';

export const isWsHandlerDeclaration = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getWsConnectionHandler = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  return getWsHandler(type, parent, reflection, errorList, (inputType) => {
    return getWsEvent(inputType, parent, reflection, errorList);
  });
};

export const getWsMessageHandler = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  return getWsHandler(type, parent, reflection, errorList, (inputType) => {
    return getWsRequest(inputType, parent, reflection, errorList);
  });
};

const isCompleteWsHandler = (type: Incomplete<WsHandler>): type is WsHandler => {
  return isObjectWith(type, ['name', 'file']);
};

const getWsHandler = (
  type: AllType,
  parent: TypeModel,
  reflection: SourceMap,
  errorList: Error[],
  resolveInput: (inputType: EveryType) => WsRequest | WsEvent | undefined
) => {
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

  if (type.parameters) {
    const [{ value: requestType }] = type.parameters;

    if (!(handler.request = resolveInput(requestType))) {
      properties.add('request');
    }
  }

  if (type.return && !(handler.response = getWsResponse(type.return, parent, reflection, errorList))) {
    properties.add('response');
  }

  if (properties.size === 0 && isCompleteWsHandler(handler)) {
    return handler;
  }

  errorList.push(new IncompleteHandlerError([...properties], type.file));

  return undefined;
};
