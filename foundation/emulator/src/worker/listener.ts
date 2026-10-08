import type { AnyObject } from '@ez4/utils';
import type { Service } from '@ez4/common';
import type { FunctionCallback } from '../types/function';

import { ServiceEventType } from '@ez4/common';

import { logErrorData } from '../utils/errors';

export const onBegin = async (listener: FunctionCallback | undefined, context: AnyObject, request: AnyObject) => {
  await invokeListener(listener, context, {
    type: ServiceEventType.Begin,
    request
  });
};

export const onReady = async (listener: FunctionCallback | undefined, context: AnyObject, request: AnyObject) => {
  await invokeListener(listener, context, {
    type: ServiceEventType.Ready,
    request
  });
};

export const onDone = async (listener: FunctionCallback | undefined, context: AnyObject, request: AnyObject) => {
  await invokeListener(listener, context, {
    type: ServiceEventType.Done,
    request
  });
};

export const onTimeout = async (listener: FunctionCallback | undefined, context: AnyObject, request: AnyObject) => {
  await invokeListener(listener, context, {
    type: ServiceEventType.Timeout,
    request
  });
};

export const onError = async (listener: FunctionCallback | undefined, context: AnyObject, error: unknown, request: AnyObject) => {
  logErrorData(error);

  await invokeListener(listener, context, {
    type: ServiceEventType.Error,
    request,
    error
  });
};

export const onEnd = async (listener: FunctionCallback | undefined, context: AnyObject, request: AnyObject) => {
  await invokeListener(listener, context, {
    type: ServiceEventType.End,
    request
  });
};

const invokeListener = async (listener: FunctionCallback | undefined, context: AnyObject, event: Service.AnyEvent<AnyObject>) => {
  try {
    await listener?.(event, context);
  } catch (error) {
    if (event.type === ServiceEventType.Begin || event.type === ServiceEventType.Ready) {
      throw error;
    }

    logErrorData(error);
  }
};
