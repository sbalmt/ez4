import type { EmulateServiceContext, EmulatorServiceRequest, ServeOptions } from '@ez4/project/library';
import type { QueueImport, QueueService, QueueSubscription } from '@ez4/queue/library';
import type { Queue } from '@ez4/queue';

import { createModule, onBegin, onEnd, onError, onReady } from '@ez4/local-common';
import { getRandomInteger, getRandomUUID } from '@ez4/utils';
import { getServiceName } from '@ez4/project/library';
import { getJsonMessage } from '@ez4/queue/utils';

import { createQueueClient } from '../service/client.js';

export const registerQueueServices = (service: QueueService | QueueImport, options: ServeOptions, context: EmulateServiceContext) => {
  const { name: serviceName, schema: messageSchema } = service;

  return {
    type: 'Queue',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    clientHandler: () => {
      return createQueueClient(serviceName, messageSchema, options);
    },
    requestHandler: (request: EmulatorServiceRequest) => {
      return handleQueueMessage(service, options, context, request);
    }
  };
};

const handleQueueMessage = async (
  service: QueueService | QueueImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  request: EmulatorServiceRequest
) => {
  if (request.method !== 'POST' || request.path !== '/' || !request.body) {
    throw new Error('Unsupported queue request.');
  }

  const subscriptionIndex = getRandomInteger(0, service.subscriptions.length - 1);
  const queueSubscription = service.subscriptions[subscriptionIndex];

  if (queueSubscription) {
    await processLambdaMessage(service, options, context, queueSubscription, request.body);
  }

  return {
    status: 204
  };
};

const processLambdaMessage = async (
  service: QueueService | QueueImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  subscription: QueueSubscription,
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

  const lambdaRequest: Partial<Queue.Incoming<Queue.Message>> = {
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
