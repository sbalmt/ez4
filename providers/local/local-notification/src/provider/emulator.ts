import type { EmulateServiceContext, EmulatorServiceRequest, ServeOptions } from '@ez4/project/library';
import type { NotificationLambdaSubscription, NotificationQueueSubscription, NotificationService } from '@ez4/notification/library';
import type { Client as QueueClient } from '@ez4/queue';
import type { Notification } from '@ez4/notification';

import { createModule, onBegin, onEnd, onError, onReady } from '@ez4/local-common';
import { NotificationSubscriptionType } from '@ez4/notification/library';
import { getJsonMessage } from '@ez4/notification/utils';
import { getServiceName } from '@ez4/project/library';
import { getRandomUUID } from '@ez4/utils';

import { createNotificationClient } from '../service/client.js';

export const registerNotificationServices = (service: NotificationService, options: ServeOptions, context: EmulateServiceContext) => {
  const { name: serviceName, schema: messageSchema } = service;

  return {
    type: 'Notification',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    clientHandler: () => {
      return createNotificationClient(serviceName, messageSchema, options);
    },
    requestHandler: (request: EmulatorServiceRequest) => {
      return handleNotificationMessage(service, request, context);
    }
  };
};

const handleNotificationMessage = async (service: NotificationService, request: EmulatorServiceRequest, context: EmulateServiceContext) => {
  if (request.method !== 'POST' || request.path !== '/' || !request.body) {
    throw new Error('Unsupported notification request.');
  }

  for (const subscription of service.subscriptions) {
    switch (subscription.type) {
      case NotificationSubscriptionType.Queue:
        await processQueueMessage(service, context, subscription, request.body);
        break;

      case NotificationSubscriptionType.Lambda:
        await processLambdaMessage(service, context, subscription, request.body);
        break;
    }
  }

  return {
    status: 204
  };
};

const processQueueMessage = async (
  service: NotificationService,
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
  service: NotificationService,
  context: EmulateServiceContext,
  subscription: NotificationLambdaSubscription,
  message: Buffer
) => {
  const lambdaModule = await createModule({
    listener: subscription.listener,
    handler: subscription.handler
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
