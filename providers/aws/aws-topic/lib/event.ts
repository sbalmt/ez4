import type { SNSEvent, Context } from 'aws-lambda';
import type { EventSchema } from '@ez4/topic/utils';
import type { Topic } from '@ez4/topic';

import { getJsonEvent } from '@ez4/topic/utils';
import { ServiceEventType, Runtime } from '@ez4/common';
import { getRandomUUID } from '@ez4/utils';

declare const __EZ4_SCHEMA: EventSchema | null;
declare const __EZ4_CONTEXT: object;

declare function dispatch(event: Topic.ServiceEvent<Topic.Event>, context: object): Promise<void>;
declare function handle(event: Topic.Incoming<Topic.Event>, context: object): Promise<any>;

/**
 * Entrypoint to handle SNS events.
 */
export async function snsEntryPoint(event: SNSEvent, context: Context): Promise<void> {
  let currentRequest: Topic.Incoming<Topic.Event> | undefined;

  const request = {
    requestId: context.awsRequestId
  };

  try {
    await onBegin(request);

    if (!__EZ4_SCHEMA) {
      throw new Error(`Validation schema for SNS event wasn't found.`);
    }

    for (const { Sns } of event.Records) {
      const payload = JSON.parse(Sns.Message);
      const event = await getJsonEvent(payload, __EZ4_SCHEMA);

      const traceId = Sns.MessageAttributes['EZ4.TRACE_ID']?.Value ?? getRandomUUID();

      currentRequest = {
        ...request,
        traceId,
        event
      };

      Runtime.setScope({
        traceId
      });

      await onReady(currentRequest);
      await handle(currentRequest, __EZ4_CONTEXT);
      await onDone(currentRequest);
    }
  } catch (error) {
    await onError(error, currentRequest ?? request);
  } finally {
    await onEnd(request);
  }
}

const onBegin = (request: Partial<Topic.Request>) => {
  return dispatch(
    {
      type: ServiceEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const onReady = (request: Partial<Topic.Incoming<Topic.Event>>) => {
  return dispatch(
    {
      type: ServiceEventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const onDone = (request: Partial<Topic.Incoming<Topic.Event>>) => {
  return dispatch(
    {
      type: ServiceEventType.Done,
      request
    },
    __EZ4_CONTEXT
  );
};

const onError = (error: unknown, request: Partial<Topic.Request | Topic.Incoming<Topic.Event>>) => {
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

const onEnd = (request: Partial<Topic.Request>) => {
  return dispatch(
    {
      type: ServiceEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
