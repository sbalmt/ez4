import type { EmulateServiceContext, EmulatorServiceRequest, ServeOptions } from '@ez4/project/library';
import type { QueueImport, QueueService } from '@ez4/queue/library';
import type { AnyObject } from '@ez4/utils';

import { getJsonMessage, MalformedMessageError } from '@ez4/queue/utils';
import { getResponseError, getResponseSuccess } from '@ez4/local-common';
import { getServiceName } from '@ez4/project/library';
import { isQueueImport } from '@ez4/queue/library';
import { getRandomInteger } from '@ez4/utils';

import { processLambdaMessage } from '../handlers/lambda.js';
import { createServiceClient } from '../client/service.js';
import { createImportedClient } from '../client/import.js';

export const registerQueueServices = (service: QueueService | QueueImport, options: ServeOptions, context: EmulateServiceContext) => {
  const { name: serviceName, schema: messageSchema } = service;

  const isImportService = isQueueImport(service);

  const clientOptions = {
    ...options,
    delay: isImportService ? 0 : (service.delay ?? 0),
    handler: (message: AnyObject) => {
      return handleQueueMessage(service, options, context, message);
    }
  };

  return {
    type: 'Queue',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    clientHandler: () => {
      return isImportService
        ? createImportedClient(serviceName, messageSchema, clientOptions)
        : createServiceClient(serviceName, messageSchema, clientOptions);
    },
    requestHandler: (request: EmulatorServiceRequest) => {
      return handleQueueRequest(service, options, context, request);
    }
  };
};

const handleQueueRequest = async (
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
    const jsonMessage = JSON.parse(body.toString());
    const safeMessage = await getJsonMessage(jsonMessage, service.schema);

    await handleQueueMessage(service, options, context, safeMessage);

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

const handleQueueMessage = async (
  service: QueueService | QueueImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  message: AnyObject
) => {
  const subscriptionIndex = getRandomInteger(0, service.subscriptions.length - 1);
  const queueSubscription = service.subscriptions[subscriptionIndex];

  if (queueSubscription) {
    await processLambdaMessage(service, options, context, queueSubscription, message);
  }
};
