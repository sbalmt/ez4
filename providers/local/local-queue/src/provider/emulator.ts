import type { EmulateServiceContext, EmulatorServiceRequest, ServeOptions } from '@ez4/project/library';
import type { QueueImport, QueueService } from '@ez4/queue/library';

import { getJsonMessage, MalformedMessageError } from '@ez4/queue/utils';
import { getResponseError, getResponseSuccess } from '@ez4/local-common';
import { getServiceName } from '@ez4/project/library';
import { isQueueService } from '@ez4/queue/library';
import { getRandomInteger } from '@ez4/utils';

import { processLambdaMessage } from '../handlers/lambda.js';
import { createQueueClient } from '../service/client.js';

export const registerQueueServices = (service: QueueService | QueueImport, options: ServeOptions, context: EmulateServiceContext) => {
  const { name: serviceName, schema: messageSchema } = service;

  const clientOptions = {
    ...options,
    delay: isQueueService(service) ? service.delay : undefined
  };

  return {
    type: 'Queue',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    clientHandler: () => {
      return createQueueClient(serviceName, messageSchema, clientOptions);
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
  const { method, path, body } = request;

  if (method !== 'POST' || path !== '/' || !body) {
    throw new Error('Unsupported queue request.');
  }

  try {
    const subscriptionIndex = getRandomInteger(0, service.subscriptions.length - 1);
    const queueSubscription = service.subscriptions[subscriptionIndex];

    const jsonMessage = JSON.parse(body.toString());
    const safeMessage = await getJsonMessage(jsonMessage, service.schema);

    if (queueSubscription) {
      await processLambdaMessage(service, options, context, queueSubscription, safeMessage);
    }

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
