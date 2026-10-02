import type { AnyObject } from '@ez4/utils';
import type { Service } from '@ez4/common';
import type { FunctionCallback } from './types';

import { ServiceEventType } from '@ez4/common';

import { logErrorData } from './utils';

export const onBegin = async (listener: FunctionCallback | undefined, context: AnyObject, request: AnyObject) => {
  await dispatchEvent(listener, context, {
    type: ServiceEventType.Begin,
    request
  });
};

export const onReady = async (listener: FunctionCallback | undefined, context: AnyObject, request: AnyObject) => {
  await dispatchEvent(listener, context, {
    type: ServiceEventType.Ready,
    request
  });
};

export const onDone = async (listener: FunctionCallback | undefined, context: AnyObject, request: AnyObject) => {
  await dispatchEvent(listener, context, {
    type: ServiceEventType.Done,
    request
  });
};

export const onTimeout = async (listener: FunctionCallback | undefined, context: AnyObject, request: AnyObject) => {
  await dispatchEvent(listener, context, {
    type: ServiceEventType.Timeout,
    request
  });
};

export const onError = async (listener: FunctionCallback | undefined, context: AnyObject, request: AnyObject, error: unknown) => {
  logErrorData(error);

  await dispatchEvent(listener, context, {
    type: ServiceEventType.Error,
    request,
    error
  });
};

export const onEnd = async (listener: FunctionCallback | undefined, context: AnyObject, request: AnyObject) => {
  await dispatchEvent(listener, context, {
    type: ServiceEventType.End,
    request
  });
};

const dispatchEvent = async (listener: FunctionCallback | undefined, context: AnyObject, event: Service.AnyEvent<AnyObject>) => {
  try {
    await listener?.(event, context);
  } catch (error) {
    if (event.type === ServiceEventType.Begin || event.type === ServiceEventType.Ready) {
      throw error;
    }

    logErrorData(error);
  }
};
