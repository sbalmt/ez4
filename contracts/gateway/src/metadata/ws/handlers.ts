import type { AllType, TypeCallback, TypeFunction, TypeModel, SourceMap, EveryType } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { WsEvent, WsHandler, WsRequest } from './types';

import { isTypeCallback, isTypeFunction } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteHandlerError } from '../../errors/handler';
import { getWsResponseMetadata } from './response';
import { getWsRequestMetadata } from './request';
import { getWsEventMetadata } from './event';

export const isWsHandlerDeclaration = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getWsConnectionHandler = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  return getWsHandler(type, parent, reflection, errorList, (inputType) => {
    return getWsEventMetadata(inputType, parent, reflection, errorList);
  });
};

export const getWsMessageHandler = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  return getWsHandler(type, parent, reflection, errorList, (inputType) => {
    return getWsRequestMetadata(inputType, parent, reflection, errorList);
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
  resolver: (inputType: EveryType) => WsRequest | WsEvent | undefined
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

    if (!(handler.request = resolver(requestType))) {
      properties.add('request');
    }
  }

  if (type.return && !(handler.response = getWsResponseMetadata(type.return, parent, reflection, errorList))) {
    properties.add('response');
  }

  if (properties.size === 0 && isCompleteWsHandler(handler)) {
    return handler;
  }

  errorList.push(new IncompleteHandlerError([...properties], type.file));

  return undefined;
};
