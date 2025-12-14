import type { AllType, SourceMap, TypeCallback, TypeFunction, TypeModel } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { AuthHandler } from './types';

import { isTypeCallback, isTypeFunction } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteAuthorizerHandlerError } from '../../errors/auth/authorizer';
import { getAuthResponseMetadata } from './response';
import { getAuthRequestMetadata } from './request';

export const isAuthHandlerDeclaration = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getAuthHandlerMetadata = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[], namespace: string) => {
  if (!isAuthHandlerDeclaration(type)) {
    return undefined;
  }

  const { description, module } = type;

  const handler: Incomplete<AuthHandler> = {
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
    const [{ value: requestType }] = type.parameters;

    handler.request = getAuthRequestMetadata(requestType, parent, reflection, errorList, namespace);
  }

  if (type.return && (handler.response = getAuthResponseMetadata(type.return, parent, reflection, errorList, namespace))) {
    properties.delete('response');
  }

  if (isCompleteHandler(handler)) {
    return handler;
  }

  errorList.push(new IncompleteAuthorizerHandlerError([...properties], type.file));

  return undefined;
};

const isCompleteHandler = (type: Incomplete<AuthHandler>): type is AuthHandler => {
  return isObjectWith(type, ['name', 'file', 'response']);
};
