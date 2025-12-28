import type { SNSEvent, Context } from 'aws-lambda';
import type { MessageSchema } from '@ez4/topic/utils';
import type { Topic } from '@ez4/topic';

import { getJsonMessage } from '@ez4/topic/utils';
import { ServiceEventType } from '@ez4/common';
import { Runtime } from '@ez4/common/runtime';
import { getRandomUUID } from '@ez4/utils';

declare const __EZ4_SCHEMA: MessageSchema | null;
declare const __EZ4_CONTEXT: object;

declare function dispatch(event: Topic.ServiceEvent<Topic.Message>, context: object): Promise<void>;
declare function handle(message: Topic.Incoming<Topic.Message>, context: object): Promise<any>;

/**
 * Entrypoint to handle SNS events.
 */
export async function snsEntryPoint(event: SNSEvent, context: Context): Promise<void> {
  let currentRequest: Topic.Incoming<Topic.Message> | undefined;

  const request = {
    requestId: context.awsRequestId
  };

  try {
    await onBegin(request);

    if (!__EZ4_SCHEMA) {
      throw new Error(`Validation schema for SNS message wasn't found.`);
    }

    for (const { Sns } of event.Records) {
      const payload = JSON.parse(Sns.Message);
      const message = await getJsonMessage(payload, __EZ4_SCHEMA);

      const traceId = Sns.MessageAttributes['EZ4.TRACE_ID']?.Value ?? getRandomUUID();

      currentRequest = {
        ...request,
        traceId,
        message
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

const onBegin = async (request: Topic.Request) => {
  return dispatch(
    {
      type: ServiceEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const onReady = async (request: Topic.Incoming<Topic.Message>) => {
  return dispatch(
    {
      type: ServiceEventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const onDone = async (request: Topic.Incoming<Topic.Message>) => {
  return dispatch(
    {
      type: ServiceEventType.Done,
      request
    },
    __EZ4_CONTEXT
  );
};

const onError = async (error: unknown, request: Topic.Request | Topic.Incoming<Topic.Message>) => {
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

const onEnd = async (request: Topic.Request) => {
  return dispatch(
    {
      type: ServiceEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
