import type { AllType, TypeCallback, TypeFunction, TypeModel, ReflectionTypes, EveryType } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { WsEvent, WsHandler, WsRequest } from './types';

import { isTypeCallback, isTypeFunction } from '@ez4/reflection';
import { getFunctionSignature, isFunctionSignature } from '@ez4/common/library';

import { IncompleteHandlerError } from '../../errors/handler';
import { getWsResponseMetadata } from './response';
import { getWsRequestMetadata } from './request';
import { getWsEventMetadata } from './event';

export const isWsHandlerDeclaration = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getWsConnectionHandler = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  return getWsHandler(type, parent, reflection, errorList, (inputType) => {
    return getWsEventMetadata(inputType, parent, reflection, errorList);
  });
};

export const getWsMessageHandler = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  return getWsHandler(type, parent, reflection, errorList, (inputType) => {
    return getWsRequestMetadata(inputType, parent, reflection, errorList);
  });
};

const getWsHandler = (
  type: AllType,
  parent: TypeModel,
  reflection: ReflectionTypes,
  errorList: Error[],
  resolver: (inputType: EveryType) => WsRequest | WsEvent | undefined
) => {
  if (!isWsHandlerDeclaration(type)) {
    return undefined;
  }

  const handler: Incomplete<WsHandler> = {
    ...getFunctionSignature(type)
  };

  const properties = new Set<string>();

  if (type.parameters) {
    const [{ value: requestType }] = type.parameters;

    if (!(handler.request = resolver(requestType))) {
      properties.add('request');
    }
  }

  if (type.return && !(handler.response = getWsResponseMetadata(type.return, parent, reflection, errorList))) {
    properties.add('response');
  }

  if (properties.size !== 0 || !isFunctionSignature(handler)) {
    errorList.push(new IncompleteHandlerError([...properties], type.file));
    return undefined;
  }

  return handler;
};
