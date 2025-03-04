import type { AllType, TypeCallback, TypeFunction } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { ServiceWatcher } from '../types/common.js';

import { isTypeCallback, isTypeFunction } from '@ez4/reflection';

import { IncompleteWatcherError } from '../errors/watcher.js';

export const isServiceWatcher = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getServiceWatcher = (type: AllType, errorList: Error[]) => {
  if (!isServiceWatcher(type)) {
    return null;
  }

  const handler: Incomplete<ServiceWatcher> = {};

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

  if (isValidHandler(handler)) {
    return handler;
  }

  errorList.push(new IncompleteWatcherError([...properties], type.file));

  return null;
};

const isValidHandler = (type: Incomplete<ServiceWatcher>): type is ServiceWatcher => {
  return !!type.name && !!type.file;
};
