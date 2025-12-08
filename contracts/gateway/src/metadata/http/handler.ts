import type { AllType, SourceMap, TypeCallback, TypeFunction, TypeModel } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { HttpHandler } from './types';

import { isTypeCallback, isTypeFunction } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteHandlerError } from '../../errors/handler';
import { getHttpProviderMetadata } from './provider';
import { getHttpResponseMetadata } from './response';
import { getHttpRequestMetadata } from './request';

export const isHttpHandlerDeclaration = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getHttpHandlerMetadata = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[], external: boolean) => {
  if (!isHttpHandlerDeclaration(type)) {
    return undefined;
  }

  const { description, module } = type;

  const handler: Incomplete<HttpHandler> = {
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
    const [{ value: requestType }, contextType] = type.parameters;

    handler.request = getHttpRequestMetadata(requestType, parent, reflection, errorList);

    if (contextType && !external) {
      handler.provider = getHttpProviderMetadata(contextType.value, parent, reflection, errorList);
    }
  }

  if (type.return && (handler.response = getHttpResponseMetadata(type.return, parent, reflection, errorList))) {
    properties.delete('response');
  }

  if (isCompleteHandler(handler)) {
    return handler;
  }

  errorList.push(new IncompleteHandlerError([...properties], type.file));

  return undefined;
};

const isCompleteHandler = (type: Incomplete<HttpHandler>): type is HttpHandler => {
  return isObjectWith(type, ['name', 'file', 'response']);
};
