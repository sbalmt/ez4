import type { AllType, TypeCallback, TypeFunction } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { ServiceListener } from '../types/common';

import { isTypeCallback, isTypeFunction } from '@ez4/reflection';

import { IncompleteListenerError } from '../errors/listener';

export const isServiceListener = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getServiceListener = (type: AllType, errorList: Error[]) => {
  if (!isServiceListener(type)) {
    return undefined;
  }

  const { description, module } = type;

  const handler: Incomplete<ServiceListener> = {
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

  if (isValidHandler(handler)) {
    return handler;
  }

  errorList.push(new IncompleteListenerError([...properties], type.file));

  return undefined;
};

const isValidHandler = (type: Incomplete<ServiceListener>): type is ServiceListener => {
  return !!type.name && !!type.file;
};
