import type { EmulateServiceContext, EmulatorServiceRequest, ServeOptions } from '@ez4/project/library';
import type { QueueService, QueueSubscription } from '@ez4/queue/library';
import type { Queue } from '@ez4/queue';

import { createModule } from '@ez4/local-common';
import { getRandomInteger, getRandomUUID } from '@ez4/utils';
import { getServiceName, Logger } from '@ez4/project/library';
import { getJsonMessage } from '@ez4/queue/utils';
import { ServiceEventType } from '@ez4/common';

import { createQueueClient } from '../service/client.js';

export const registerQueueServices = (service: QueueService, options: ServeOptions, context: EmulateServiceContext) => {
  const { name: serviceName, schema: messageSchema } = service;

  return {
    type: 'Queue',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    clientHandler: () => {
      return createQueueClient(serviceName, messageSchema, options);
    },
    requestHandler: (request: EmulatorServiceRequest) => {
      return handleQueueMessage(service, context, request);
    }
  };
};

const handleQueueMessage = async (service: QueueService, context: EmulateServiceContext, request: EmulatorServiceRequest) => {
  if (request.method !== 'POST' || request.path !== '/' || !request.body) {
    throw new Error('Unsupported queue request.');
  }

  const subscriptionIndex = getRandomInteger(0, service.subscriptions.length - 1);
  const queueSubscription = service.subscriptions[subscriptionIndex];

  await processLambdaMessage(service, context, queueSubscription, request.body);

  return {
    status: 204
  };
};

const processLambdaMessage = async (
  service: QueueService,
  context: EmulateServiceContext,
  subscription: QueueSubscription,
  message: Buffer
) => {
  const lambdaModule = await createModule({
    listener: subscription.listener,
    handler: subscription.handler
  });

  const lambdaContext = service.services && context.makeClients(service.services);

  let request: Partial<Queue.Incoming<Queue.Message>> = {
    requestId: getRandomUUID()
  };

  try {
    await lambdaModule.listener?.({ type: ServiceEventType.Begin, request }, lambdaContext);

    const jsonMessage = JSON.parse(message.toString());
    const safeMessage = await getJsonMessage(jsonMessage, service.schema);

    request = {
      ...request,
      message: safeMessage
    };

    await lambdaModule.listener?.({ type: ServiceEventType.Ready, request }, lambdaContext);

    await lambdaModule.handler(request, lambdaContext);
  } catch (error) {
    await lambdaModule.listener?.({ type: ServiceEventType.Error, request, error }, lambdaContext);
    Logger.error(`${error}`);
  } finally {
    await lambdaModule.listener?.({ type: ServiceEventType.End, request }, lambdaContext);
  }
};
