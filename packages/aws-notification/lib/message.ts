import type { MessageSchema } from '@ez4/aws-notification/runtime';
import type { Notification } from '@ez4/notification';
import type { SNSEvent, Context } from 'aws-lambda';
import type { Service } from '@ez4/common';

import { getJsonMessage } from '@ez4/aws-notification/runtime';
import { EventType } from '@ez4/common';

declare const __EZ4_SCHEMA: MessageSchema | null;
declare const __EZ4_CONTEXT: object;

declare function handle(
  message: Notification.Incoming<Notification.Message>,
  context: object
): Promise<any>;

declare function dispatch(
  event: Service.Event<Notification.Incoming<Notification.Message>>,
  context: object
): Promise<void>;

/**
 * Entrypoint to handle SNS events.
 */
export async function snsEntryPoint(event: SNSEvent, context: Context): Promise<void> {
  let lastRequest: Notification.Incoming<Notification.Message> | undefined;

  const request = {
    requestId: context.awsRequestId
  };

  try {
    await onBegin(request);

    if (!__EZ4_SCHEMA) {
      throw new Error(`Validation schema for SNS message not found.`);
    }

    for (const record of event.Records) {
      const body = JSON.parse(record.Sns.Message);
      const message = await getJsonMessage(body, __EZ4_SCHEMA);

      lastRequest = {
        ...request,
        message
      };

      await onReady(lastRequest);

      await handle(lastRequest, __EZ4_CONTEXT);
    }
  } catch (error) {
    await onError(error, lastRequest ?? request);
  } finally {
    await onEnd(request);
  }
}

const onBegin = async (request: Partial<Notification.Incoming<Notification.Message>>) => {
  return dispatch(
    {
      type: EventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const onReady = async (request: Partial<Notification.Incoming<Notification.Message>>) => {
  return dispatch(
    {
      type: EventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const onError = async (
  error: Error,
  request: Partial<Notification.Incoming<Notification.Message>>
) => {
  console.error(error);

  return dispatch(
    {
      type: EventType.Error,
      request,
      error
    },
    __EZ4_CONTEXT
  );
};

const onEnd = async (request: Partial<Notification.Incoming<Notification.Message>>) => {
  return dispatch(
    {
      type: EventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
