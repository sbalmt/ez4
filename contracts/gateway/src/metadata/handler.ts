import type { AllType, SourceMap, TypeModel } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { HttpHandler } from '../types/common';

import { IncompleteHandlerError } from '../errors/handler';
import { getHttpHandlerResponse } from './response';
import { getHttpHandlerRequest } from './request';
import { getHttpContext } from './context';
import { isHttpHandler } from './utils';

export const getHttpHandler = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isHttpHandler(type)) {
    return null;
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
    const [{ value: requestType }, requestContext] = type.parameters;

    handler.request = getHttpHandlerRequest(requestType, parent, reflection, errorList);

    if (requestContext) {
      handler.context = getHttpContext(requestContext.value, parent, reflection, errorList);
    }
  }

  if (type.return) {
    const response = getHttpHandlerResponse(type.return, parent, reflection, errorList);

    if (response) {
      handler.response = response;
      properties.delete('response');
    }
  }

  if (isValidHandler(handler)) {
    return handler;
  }

  errorList.push(new IncompleteHandlerError([...properties], type.file));

  return null;
};

const isValidHandler = (type: Incomplete<HttpHandler>): type is HttpHandler => {
  return !!type.name && !!type.file && !!type.response;
};
