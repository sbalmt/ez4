import type { AllType, SourceMap, TypeModel } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { HttpAuthorizer } from '../../types/common';

import { IncompleteAuthorizerError } from '../../errors/http/authorizer';
import { getHttpAuthResponse } from './response';
import { getHttpAuthRequest } from './request';
import { isHttpAuthorizer } from './utils';

export const getHttpAuthorizer = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isHttpAuthorizer(type)) {
    return undefined;
  }

  const { description, module } = type;

  const handler: Incomplete<HttpAuthorizer> = {
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

    handler.request = getHttpAuthRequest(requestType, parent, reflection, errorList);
  }

  if (type.return) {
    handler.response = getHttpAuthResponse(type.return, parent, reflection, errorList);
  }

  if (isValidAuthorizer(handler)) {
    return handler;
  }

  errorList.push(new IncompleteAuthorizerError([...properties], type.file));

  return undefined;
};

const isValidAuthorizer = (type: Incomplete<HttpAuthorizer>): type is HttpAuthorizer => {
  return !!type.name && !!type.file;
};
