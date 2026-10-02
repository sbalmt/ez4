import type { MessagePort } from 'node:worker_threads';
import { getRandomUUID, type AnyObject } from '@ez4/utils';
import type { FunctionCallback } from './types';

import { Runtime } from '@ez4/common';

import { onBegin, onDone, onEnd, onError, onReady } from './dispatcher';
import { notifyResult } from './notifier';

export const invokeHandler = async (
  worker: MessagePort,
  handler: FunctionCallback,
  listener: FunctionCallback | undefined,
  context: AnyObject,
  request: AnyObject
) => {
  let response: unknown;

  Runtime.setScope({
    traceId: getRandomUUID()
  });

  try {
    await onBegin(listener, context, request);

    await onReady(listener, context, request);

    response = await handler(request, context);

    await onDone(listener, context, request);
  } catch (error) {
    await onError(listener, context, request, error);
    throw error;
  } finally {
    await onEnd(listener, context, request);
  }

  notifyResult(worker, response);
};
