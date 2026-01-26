import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { Cron } from '@ez4/scheduler';
import type { Context } from 'aws-lambda';

import { getJsonEvent } from '@ez4/scheduler/utils';
import { ServiceEventType, Runtime } from '@ez4/common';
import { getRandomUUID } from '@ez4/utils';

declare const __EZ4_SCHEMA: ObjectSchema | UnionSchema | null;
declare const __EZ4_CONTEXT: object;

declare function dispatch(event: Cron.ServiceEvent<Cron.Event | null>, context: object): Promise<void>;
declare function handle(request: Cron.Incoming<Cron.Event | null>, context: object): Promise<void>;

/**
 * Entrypoint to handle EventBridge scheduler events.
 */
export async function eventEntryPoint(payload: AnyObject | null, context: Context): Promise<void> {
  const traceId = payload?.traceId ?? getRandomUUID();

  const request: Cron.Incoming<Cron.Event | null> = {
    requestId: context.awsRequestId,
    event: null,
    traceId
  };

  Runtime.setScope({
    traceId
  });

  try {
    await onBegin(request);

    if (__EZ4_SCHEMA) {
      Object.assign(request, { event: await getJsonEvent(payload?.event, __EZ4_SCHEMA) });
    }

    await onReady(request);
    await handle(request, __EZ4_CONTEXT);
    await onDone(request);
  } catch (error) {
    await onError(error, request);
  } finally {
    await onEnd(request);
  }
}

const onBegin = async (request: Cron.Incoming<Cron.Event | null>) => {
  return dispatch(
    {
      type: ServiceEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const onReady = async (request: Cron.Incoming<Cron.Event | null>) => {
  return dispatch(
    {
      type: ServiceEventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const onDone = async (request: Cron.Incoming<Cron.Event | null>) => {
  return dispatch(
    {
      type: ServiceEventType.Done,
      request
    },
    __EZ4_CONTEXT
  );
};

const onError = async (error: unknown, request: Cron.Incoming<Cron.Event | null>) => {
  console.error({ ...Runtime.getScope(), error });

  return dispatch(
    {
      type: ServiceEventType.Error,
      request,
      error
    },
    __EZ4_CONTEXT
  );
};

const onEnd = async (request: Cron.Incoming<Cron.Event | null>) => {
  return dispatch(
    {
      type: ServiceEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
