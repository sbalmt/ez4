import type { AllType, ReflectionTypes, TypeCallback, TypeFunction, TypeModel } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { HttpHandler } from './types';

import { isTypeCallback, isTypeFunction } from '@ez4/reflection';
import { getFunctionSignature, isFunctionSignature } from '@ez4/common/library';
import { isObjectWith } from '@ez4/utils';

import { IncompleteHandlerError } from '../../errors/handler';
import { getWebProviderMetadata } from '../provider';
import { getHttpResponseMetadata } from './response';
import { getHttpRequestMetadata } from './request';
import { HttpNamespaceType } from './types';

export const isHttpHandlerDeclaration = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getHttpHandlerMetadata = (
  type: AllType,
  parent: TypeModel,
  reflection: ReflectionTypes,
  errorList: Error[],
  external: boolean
) => {
  if (!isHttpHandlerDeclaration(type)) {
    return undefined;
  }

  const handler: Incomplete<HttpHandler> = {
    ...getFunctionSignature(type)
  };

  const properties = new Set(['response']);

  if (type.parameters) {
    const [{ value: requestType }, contextType] = type.parameters;

    handler.request = getHttpRequestMetadata(requestType, parent, reflection, errorList);

    if (contextType && !external) {
      handler.provider = getWebProviderMetadata(contextType.value, parent, reflection, errorList, HttpNamespaceType);
      handler.isolated = true;
    }
  }

  if (type.return && (handler.response = getHttpResponseMetadata(type.return, parent, reflection, errorList))) {
    properties.delete('response');
  }

  if (!isCompleteHandler(handler)) {
    errorList.push(new IncompleteHandlerError([...properties], type.file));
    return undefined;
  }

  return handler;
};

const isCompleteHandler = (type: Incomplete<HttpHandler>): type is HttpHandler => {
  return isObjectWith(type, ['response']) && isFunctionSignature(type);
};
