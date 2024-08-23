import type { Incomplete } from '@ez4/utils';
import type { AllType, SourceMap } from '@ez4/reflection';
import type { HttpAuthorizer } from '../types/authorizer.js';

import { IncompleteAuthorizerError } from '../errors/authorizer.js';
import { getHttpAuthorizerResponse } from './response.js';
import { getHttpAuthorizerRequest } from './request.js';
import { isHttpAuthorizer } from './utils.js';

export const getHttpAuthorizer = (type: AllType, reflection: SourceMap, errorList: Error[]) => {
  if (!isHttpAuthorizer(type)) {
    return null;
  }

  const handler: Incomplete<HttpAuthorizer> = {};
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

  if (type.parameters) {
    const requestType = type.parameters[0].value;

    handler.request = getHttpAuthorizerRequest(requestType, type, reflection, errorList);
  }

  if (type.return) {
    handler.response = getHttpAuthorizerResponse(type.return, type, reflection, errorList);
  }

  if (isValidAuthorizer(handler)) {
    return handler;
  }

  errorList.push(new IncompleteAuthorizerError([...properties], type.file));

  return null;
};

const isValidAuthorizer = (type: Incomplete<HttpAuthorizer>): type is HttpAuthorizer => {
  return !!type.name && !!type.file;
};
