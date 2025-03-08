import type { AllType, SourceMap, TypeModel } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { HttpAuthorizer } from '../types/common.js';

import { IncompleteAuthorizerError } from '../errors/authorizer.js';
import { getHttpAuthResponse } from './response.js';
import { getHttpAuthRequest } from './request.js';
import { isHttpAuthorizer } from './utils.js';

export const getHttpAuthorizer = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
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
    const [{ value: requestType }] = type.parameters;

    handler.request = getHttpAuthRequest(requestType, parent, reflection, errorList);
  }

  if (type.return) {
    handler.response = getHttpAuthResponse(type.return, parent, reflection, errorList);
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
