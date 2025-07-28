import type { SNSEvent, Context } from 'aws-lambda';
import type { MessageSchema } from '@ez4/notification/utils';
import type { Notification } from '@ez4/notification';

import * as NotificationUtils from '@ez4/notification/utils';

import { ServiceEventType } from '@ez4/common';

declare const __EZ4_SCHEMA: MessageSchema | null;
declare const __EZ4_CONTEXT: object;

declare function dispatch(event: Notification.ServiceEvent<Notification.Message>, context: object): Promise<void>;
declare function handle(message: Notification.Incoming<Notification.Message>, context: object): Promise<any>;

/**
 * Entrypoint to handle SNS events.
 */
export async function snsEntryPoint(event: SNSEvent, context: Context): Promise<void> {
  let currentRequest: Notification.Incoming<Notification.Message> | undefined;

  const request = {
    requestId: context.awsRequestId
  };

  try {
    await onBegin(request);

    if (!__EZ4_SCHEMA) {
      throw new Error(`Validation schema for SNS message not found.`);
    }

    for (const record of event.Records) {
      const payload = JSON.parse(record.Sns.Message);
      const message = await NotificationUtils.getJsonMessage(payload, __EZ4_SCHEMA);

      currentRequest = {
        ...request,
        message
      };

      await onReady(currentRequest);

      await handle(currentRequest, __EZ4_CONTEXT);
    }
  } catch (error) {
    await onError(error, currentRequest ?? request);
  } finally {
    await onEnd(request);
  }
}

const onBegin = async (request: Notification.Request) => {
  return dispatch(
    {
      type: ServiceEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const onReady = async (request: Notification.Incoming<Notification.Message>) => {
  return dispatch(
    {
      type: ServiceEventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const onError = async (error: Error, request: Notification.Request | Notification.Incoming<Notification.Message>) => {
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

const onEnd = async (request: Notification.Request) => {
  return dispatch(
    {
      type: ServiceEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
