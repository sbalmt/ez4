import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { Context, ScheduledEvent } from 'aws-lambda';
import type { Service } from '@ez4/common';
import type { Cron } from '@ez4/scheduler';

import { getJsonEvent } from '@ez4/aws-scheduler/runtime';
import { WatcherEventType } from '@ez4/common';

declare const __EZ4_CONTEXT: object;
declare const __EZ4_SCHEMA: ObjectSchema | UnionSchema | null;

declare function handle(request: Cron.Incoming<Cron.Event>, context: object): Promise<void>;
declare function handle(context: object): Promise<void>;

declare function watch(
  event: Service.WatcherEvent<Cron.Incoming<Cron.Event>>,
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
    await watchBegin(request);

    if (!__EZ4_SCHEMA) {
      await handle(__EZ4_CONTEXT);
      return;
    }

    const safeEvent = await getJsonEvent(event, __EZ4_SCHEMA);

    lastRequest = {
      ...request,
      event: safeEvent
    };

    await handle(lastRequest, __EZ4_CONTEXT);
  } catch (error) {
    await watchError(error, lastRequest ?? request);
  } finally {
    await watchEnd(request);
  }
}

const watchBegin = async (request: Partial<Cron.Incoming<Cron.Event>>) => {
  return watch(
    {
      type: WatcherEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const watchError = async (error: Error, request: Partial<Cron.Incoming<Cron.Event>>) => {
  console.error(error);

  return watch(
    {
      type: WatcherEventType.Error,
      request,
      error
    },
    __EZ4_CONTEXT
  );
};

const watchEnd = async (request: Partial<Cron.Incoming<Cron.Event>>) => {
  return watch(
    {
      type: WatcherEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
