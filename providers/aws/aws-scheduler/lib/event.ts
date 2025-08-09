import type { Context, ScheduledEvent } from 'aws-lambda';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { Cron } from '@ez4/scheduler';

import { getJsonEvent } from '@ez4/scheduler/utils';
import { ServiceEventType } from '@ez4/common';

declare const __EZ4_SCHEMA: ObjectSchema | UnionSchema | null;
declare const __EZ4_CONTEXT: object;

declare function dispatch(event: Cron.ServiceEvent<Cron.Event | null>, context: object): Promise<void>;
declare function handle(request: Cron.Incoming<Cron.Event | null>, context: object): Promise<void>;

/**
 * Entrypoint to handle EventBridge scheduler events.
 */
export async function eventEntryPoint(event: ScheduledEvent, context: Context): Promise<void> {
  const request: Cron.Incoming<Cron.Event | null> = {
    requestId: context.awsRequestId,
    event: null
  };

  try {
    await onBegin(request);

    if (__EZ4_SCHEMA) {
      request.event = await getJsonEvent(event, __EZ4_SCHEMA);

      await onReady(request);
    }

    await handle(request, __EZ4_CONTEXT);
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

const onError = async (error: Error, request: Cron.Incoming<Cron.Event | null>) => {
  console.error(error);

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
