import type { AllType, TypeCallback, TypeFunction } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { FactoryHandler } from './types';

import { isTypeCallback, isTypeFunction } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteHandlerError } from '../errors/handler';

export const isFactoryHandlerDeclaration = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getFactoryHandlerMetadata = (type: AllType, errorList: Error[]) => {
  if (!isFactoryHandlerDeclaration(type)) {
    return undefined;
  }

  const { description, module } = type;

  const handler: Incomplete<FactoryHandler> = {
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

  if (isCompleteHandler(handler)) {
    return handler;
  }

  errorList.push(new IncompleteHandlerError([...properties], type.file));

  return undefined;
};

const isCompleteHandler = (type: Incomplete<FactoryHandler>): type is FactoryHandler => {
  return isObjectWith(type, ['name', 'file']);
};
