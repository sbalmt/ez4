import type { MessagePort } from 'node:worker_threads';
import type { AnyObject } from '@ez4/utils';
import type { FunctionCallback } from '../types/function';
import type { ModuleManager } from '../types/module';

import { onBegin, onDone, onEnd, onError, onReady, onTimeout } from './listener';
import { notifyResult } from './notifier';

export const invokeHandler = async (
  worker: MessagePort,
  handler: FunctionCallback,
  listener: FunctionCallback | undefined,
  manager: ModuleManager,
  context: AnyObject,
  request: AnyObject,
  timeout: number
) => {
  let preparedRequest: AnyObject | undefined;
  let responseResult: unknown;

  const milliseconds = Math.max(0, timeout - 1000);

  const timeoutEvent = setTimeout(() => {
    const finishedRequest = manager.finishRequest(createdRequest, preparedRequest);
    onTimeout(listener, context, finishedRequest);
  }, milliseconds);

  const createdRequest = await manager.beginRequest(request);

  try {
    await onBegin(listener, context, createdRequest);
    preparedRequest = await manager.prepareRequest(createdRequest, request, context);

    await onReady(listener, context, preparedRequest);
    responseResult = await handler(preparedRequest, context);

    await onDone(listener, context, preparedRequest);
  } catch (error) {
    const finishedRequest = manager.finishRequest(createdRequest, preparedRequest, error);
    await onError(listener, context, error, finishedRequest);

    throw error;
  } finally {
    clearTimeout(timeoutEvent);
    const finishedRequest = manager.finishRequest(createdRequest, preparedRequest);
    await onEnd(listener, context, finishedRequest);
  }

  notifyResult(worker, responseResult);
};
