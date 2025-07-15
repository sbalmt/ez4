import type { EmulateServiceContext, EmulatorServiceRequest, ServeOptions } from '@ez4/project/library';
import type { Client as QueueClient } from '@ez4/queue';
import type { Notification } from '@ez4/notification';

import type {
  NotificationImport,
  NotificationLambdaSubscription,
  NotificationQueueSubscription,
  NotificationService
} from '@ez4/notification/library';

import { createModule, onBegin, onEnd, onError, onReady } from '@ez4/local-common';
import { NotificationSubscriptionType } from '@ez4/notification/library';
import { getJsonMessage } from '@ez4/notification/utils';
import { getServiceName } from '@ez4/project/library';
import { getRandomUUID } from '@ez4/utils';

import { createNotificationClient } from '../service/client.js';

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
  if (request.method !== 'POST' || request.path !== '/' || !request.body) {
    throw new Error('Unsupported notification request.');
  }

  for (const subscription of service.subscriptions) {
    switch (subscription.type) {
      case NotificationSubscriptionType.Queue:
        await processQueueMessage(service, context, subscription, request.body);
        break;

      case NotificationSubscriptionType.Lambda:
        await processLambdaMessage(service, options, context, subscription, request.body);
        break;
    }
  }

  return {
    status: 204
  };
};

const processQueueMessage = async (
  service: NotificationService | NotificationImport,
  context: EmulateServiceContext,
  subscription: NotificationQueueSubscription,
  message: Buffer
) => {
  const jsonMessage = JSON.parse(message.toString());
  const safeMessage = await getJsonMessage(jsonMessage, service.schema);

  const queueClient = context.makeClient(subscription.service) as QueueClient<any>;

  await queueClient.sendMessage(safeMessage);
};

const processLambdaMessage = async (
  service: NotificationService | NotificationImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  subscription: NotificationLambdaSubscription,
  message: Buffer
) => {
  const lambdaModule = await createModule({
    listener: subscription.listener,
    handler: subscription.handler,
    variables: {
      ...options.variables,
      ...service.variables,
      ...subscription.variables
    }
  });

  const lambdaContext = service.services && context.makeClients(service.services);

  const lambdaRequest: Partial<Notification.Incoming<Notification.Message>> = {
    requestId: getRandomUUID()
  };

  try {
    await onBegin(lambdaModule, lambdaContext, lambdaRequest);

    const jsonMessage = JSON.parse(message.toString());
    const safeMessage = await getJsonMessage(jsonMessage, service.schema);

    Object.assign(lambdaRequest, { message: safeMessage });

    await onReady(lambdaModule, lambdaContext, lambdaRequest);
    await lambdaModule.handler(lambdaRequest, lambdaContext);
    //
  } catch (error) {
    await onError(lambdaModule, lambdaContext, lambdaRequest, error);
    //
  } finally {
    await onEnd(lambdaModule, lambdaContext, lambdaRequest);
  }
};
