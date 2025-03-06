import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { Context, ScheduledEvent } from 'aws-lambda';
import type { Service } from '@ez4/common';
import type { Cron } from '@ez4/scheduler';

import { getJsonEvent } from '@ez4/aws-scheduler/runtime';
import { ServiceEventType } from '@ez4/common';

declare const __EZ4_SCHEMA: ObjectSchema | UnionSchema | null;
declare const __EZ4_CONTEXT: object;

declare function handle(request: Cron.Incoming<Cron.Event>, context: object): Promise<void>;
declare function handle(context: object): Promise<void>;

declare function dispatch(
  event: Service.Event<Cron.Incoming<Cron.Event>>,
  context: object
): Promise<void>;

/**
 * Entrypoint to handle EventBridge scheduler events.
 */
export async function eventEntryPoint(event: ScheduledEvent, context: Context): Promise<void> {
  let lastRequest: Cron.Incoming<Cron.Event> | undefined;

  const request = {
    requestId: context.awsRequestId
  };

  try {
    await onBegin(request);

    if (!__EZ4_SCHEMA) {
      await handle(__EZ4_CONTEXT);
      return;
    }

    const safeEvent = await getJsonEvent(event, __EZ4_SCHEMA);

    lastRequest = {
      ...request,
      event: safeEvent
    };

    await onReady(lastRequest);

    await handle(lastRequest, __EZ4_CONTEXT);
  } catch (error) {
    await onError(error, lastRequest ?? request);
  } finally {
    await onEnd(request);
  }
}

const onBegin = async (request: Partial<Cron.Incoming<Cron.Event>>) => {
  return dispatch(
    {
      type: ServiceEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const onReady = async (request: Partial<Cron.Incoming<Cron.Event>>) => {
  return dispatch(
    {
      type: ServiceEventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const onError = async (error: Error, request: Partial<Cron.Incoming<Cron.Event>>) => {
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

const onEnd = async (request: Partial<Cron.Incoming<Cron.Event>>) => {
  return dispatch(
    {
      type: ServiceEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
