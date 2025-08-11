import type { EmulateServiceContext, EmulatorServiceRequest, ServeOptions } from '@ez4/project/library';
import type { NotificationImport, NotificationService } from '@ez4/notification/library';

import { isNotificationImport, NotificationSubscriptionType } from '@ez4/notification/library';
import { getJsonMessage, MalformedMessageError } from '@ez4/notification/utils';
import { getResponseError, getResponseSuccess } from '@ez4/local-common';
import { getServiceName } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';

import { processLambdaMessage } from '../handlers/lambda.js';
import { processQueueMessage } from '../handlers/queue.js';
import { createServiceClient } from '../client/service.js';
import { createImportedClient } from '../client/import.js';

export const registerNotificationServices = (
  service: NotificationService | NotificationImport,
  options: ServeOptions,
  context: EmulateServiceContext
) => {
  const { name: serviceName, schema: messageSchema } = service;

  const clientOptions = {
    ...options,
    handler: (message: AnyObject) => {
      return handleNotificationMessage(service, options, context, message);
    }
  };

  return {
    type: 'Notification',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    clientHandler: () => {
      return isNotificationImport(service)
        ? createImportedClient(serviceName, messageSchema, clientOptions)
        : createServiceClient(serviceName, messageSchema, clientOptions);
    },
    requestHandler: (request: EmulatorServiceRequest) => {
      return handleNotificationRequest(service, options, context, request);
    }
  };
};

const handleNotificationRequest = async (
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

    await handleNotificationMessage(service, options, context, safeMessage);

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

const handleNotificationMessage = async (
  service: NotificationService | NotificationImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  message: AnyObject
) => {
  const allNotifications = service.subscriptions.map((subscription) => {
    switch (subscription.type) {
      case NotificationSubscriptionType.Lambda:
        return processLambdaMessage(service, options, context, subscription, message);

      case NotificationSubscriptionType.Queue:
        return processQueueMessage(context, subscription, message);
    }
  });

  await Promise.all(allNotifications);
};
