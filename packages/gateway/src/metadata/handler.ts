import type { Incomplete } from '@ez4/utils';
import type { AllType, SourceMap } from '@ez4/reflection';
import type { HttpHandler } from '../types/handler.js';

import { IncompleteHandlerError } from '../errors/handler.js';
import { getHttpResponse } from './response.js';
import { getHttpRequest } from './request.js';
import { isHttpHandler } from './utils.js';

export const getHttpHandler = (type: AllType, reflection: SourceMap, errorList: Error[]) => {
  if (!isHttpHandler(type)) {
    return null;
  }

  const handler: Incomplete<HttpHandler> = {};
  const properties = new Set(['name', 'file', 'response']);

  if (type.description) {
    handler.description = type.description;
  }

  if ((handler.name = type.name)) {
    properties.delete('name');
  }

  if ((handler.file = type.file)) {
    properties.delete('file');
  }

  if (type.parameters) {
    handler.request = getHttpRequest(type.parameters[0].value, type, reflection, errorList);
  }

  if (type.return) {
    if ((handler.response = getHttpResponse(type.return, type, reflection, errorList))) {
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
