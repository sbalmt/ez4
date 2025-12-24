import type { AllType } from '@ez4/reflection';

import { getFunctionSignature } from '@ez4/common/library';

import { IncompleteHandlerError } from '../errors/handler';
import { isEventHandler } from './utils';

export const getEventHandler = (type: AllType, errorList: Error[]) => {
  if (!isEventHandler(type)) {
    return undefined;
  }

  const handler = getFunctionSignature(type);

  if (!handler) {
    errorList.push(new IncompleteHandlerError(type.file));
  }

  return handler;
};
