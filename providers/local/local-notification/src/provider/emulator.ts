import type { EmulateServiceContext, EmulatorServiceRequest, ServeOptions } from '@ez4/project/library';
import type { NotificationImport, NotificationService } from '@ez4/notification/library';

import { NotificationSubscriptionType } from '@ez4/notification/library';
import { getJsonMessage, MalformedMessageError } from '@ez4/notification/utils';
import { getResponseError, getResponseSuccess } from '@ez4/local-common';
import { getServiceName } from '@ez4/project/library';

import { createNotificationClient } from '../service/client.js';
import { processLambdaMessage } from '../handlers/lambda.js';
import { processQueueMessage } from '../handlers/queue.js';

export const registerNotificationServices = (
  service: NotificationService | NotificationImport,
  options: ServeOptions,
  context: EmulateServiceContext
) => {
  const { name: serviceName, schema: messageSchema } = service;

  return {
    type: 'Notification',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    clientHandler: () => {
      return createNotificationClient(serviceName, messageSchema, options);
    },
    requestHandler: (request: EmulatorServiceRequest) => {
      return handleNotificationMessage(service, options, context, request);
    }
  };
};

const handleNotificationMessage = async (
  service: NotificationService | NotificationImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  request: EmulatorServiceRequest
) => {
  const { method, path, body } = request;

  if (method !== 'POST' || path !== '/' || !body) {
    throw new Error('Unsupported notification request.');
  }

  try {
    const jsonMessage = JSON.parse(body.toString());
    const safeMessage = await getJsonMessage(jsonMessage, service.schema);

    const allNotifications = service.subscriptions.map((subscription) => {
      switch (subscription.type) {
        case NotificationSubscriptionType.Lambda:
          return processLambdaMessage(service, options, context, subscription, safeMessage);

        case NotificationSubscriptionType.Queue:
          return processQueueMessage(service, context, subscription, safeMessage);
      }
    });

    await Promise.all(allNotifications);

    return getResponseSuccess(201);
    //
  } catch (error) {
    if (!(error instanceof MalformedMessageError)) {
      throw error;
    }

    return getResponseError(400, {
      message: error.message,
      details: error.details
    });
  }
};
