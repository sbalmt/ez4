import type { MessagePort } from 'node:worker_threads';
import type { AnyObject } from '@ez4/utils';
import type { FunctionCallback } from '../types/common';
import type { ModuleManager } from '../types/module';

import { onBegin, onDone, onEnd, onError, onReady } from './dispatcher';
import { notifyResult } from './notifier';

export const invokeHandler = async (
  worker: MessagePort,
  handler: FunctionCallback,
  listener: FunctionCallback | undefined,
  manager: ModuleManager,
  context: AnyObject,
  request: AnyObject
) => {
  let currentRequest: AnyObject | undefined;
  let responseResult: unknown;

  const minimalRequest = manager.createRequest(request);

  try {
    await onBegin(listener, context, minimalRequest);
    currentRequest = await manager.prepareRequest(minimalRequest, context);

    await onReady(listener, context, currentRequest);
    responseResult = await handler(currentRequest, context);

    await onDone(listener, context, currentRequest);
  } catch (error) {
    const finishedRequest = manager.finishRequest(minimalRequest, currentRequest, error);
    await onError(listener, context, error, finishedRequest);

    throw error;
  } finally {
    const finishedRequest = manager.finishRequest(minimalRequest, currentRequest);
    await onEnd(listener, context, finishedRequest);
  }

  notifyResult(worker, responseResult);
};
