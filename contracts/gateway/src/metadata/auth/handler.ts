import type { AllType, ReflectionTypes, TypeCallback, TypeFunction, TypeModel } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { AuthHandler } from './types';

import { isTypeCallback, isTypeFunction } from '@ez4/reflection';
import { getFunctionSignature, isFunctionSignature } from '@ez4/common/library';
import { isObjectWith } from '@ez4/utils';

import { IncompleteAuthorizerHandlerError } from '../../errors/auth/authorizer';
import { getWebProviderMetadata } from '../provider';
import { getAuthResponseMetadata } from './response';
import { getAuthRequestMetadata } from './request';

export const isAuthHandlerDeclaration = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getAuthHandlerMetadata = (
  type: AllType,
  parent: TypeModel,
  reflection: ReflectionTypes,
  errorList: Error[],
  namespace: string
) => {
  if (!isAuthHandlerDeclaration(type)) {
    return undefined;
  }

  const handler: Incomplete<AuthHandler> = {
    ...getFunctionSignature(type)
  };

  const properties = new Set(['response']);

  if (type.parameters) {
    const [{ value: requestType }, contextType] = type.parameters;

    handler.request = getAuthRequestMetadata(requestType, parent, reflection, errorList, namespace);

    if (contextType) {
      handler.provider = getWebProviderMetadata(contextType.value, parent, reflection, errorList, namespace);
    }
  }

  if (type.return && (handler.response = getAuthResponseMetadata(type.return, parent, reflection, errorList, namespace))) {
    properties.delete('response');
  }

  if (!isCompleteHandler(handler)) {
    errorList.push(new IncompleteAuthorizerHandlerError([...properties], type.file));

    return undefined;
  }

  return handler;
};

const isCompleteHandler = (type: Incomplete<AuthHandler>): type is AuthHandler => {
  return isObjectWith(type, ['response']) && isFunctionSignature(type);
};
