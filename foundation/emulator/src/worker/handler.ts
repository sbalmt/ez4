import type { MessagePort } from 'node:worker_threads';
import type { AnyObject } from '@ez4/utils';
import type { FunctionCallback } from '../types/function';
import type { ModuleInvoker } from '../types/module';

import { onBegin, onDone, onEnd, onError, onReady, onTimeout } from './listener';
import { notifyData } from './notifier';

export const invokeHandler = async (
  worker: MessagePort,
  handler: FunctionCallback,
  listener: FunctionCallback | undefined,
  invoker: ModuleInvoker,
  context: AnyObject,
  request: AnyObject,
  timeout: number
) => {
  let currentRequest: AnyObject = {};

  const milliseconds = Math.max(0, timeout - 1000);
  const timeoutEvent = setTimeout(() => onTimeout(listener, context, currentRequest), milliseconds);

  try {
    const response = await invoker({
      request,
      context,
      begin: (request: AnyObject) => ((currentRequest = request), onBegin(listener, context, request)),
      ready: (request: AnyObject) => ((currentRequest = request), onReady(listener, context, request)),
      invoke: (request: AnyObject) => ((currentRequest = request), handler(request, context)),
      done: (request: AnyObject) => ((currentRequest = request), onDone(listener, context, request)),
      error: (error: unknown, request: AnyObject) => ((currentRequest = request), onError(listener, context, error, request)),
      end: (request: AnyObject) => ((currentRequest = request), onEnd(listener, context, request))
    });

    notifyData(worker, response);
  } finally {
    clearTimeout(timeoutEvent);
  }
};
