import type { EmulateServiceContext, EmulatorRequestEvent, ServeOptions } from '@ez4/project/library';
import type { QueueImport, QueueService } from '@ez4/queue/library';
import type { AnyObject } from '@ez4/utils';

import { getErrorResponse, getSuccessResponse } from '@ez4/local-common';
import { getJsonMessage, MalformedMessageError } from '@ez4/queue/utils';
import { getServiceName } from '@ez4/project/library';
import { getRandomInteger } from '@ez4/utils';

import { processLambdaMessage } from '../handlers/lambda';
import { createLocalClient } from '../client/local';

export const registerLocalServices = (service: QueueService, options: ServeOptions, context: EmulateServiceContext) => {
  const { name: serviceName, schema: messageSchema } = service;

  const clientOptions = {
    ...options,
    delay: service.delay ?? 0,
    handler: (message: AnyObject) => {
      return handleQueueMessage(service, options, context, message);
    }
  };

  return {
    type: 'Queue',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    exportHandler: () => {
      return createLocalClient(serviceName, messageSchema, clientOptions);
    },
    requestHandler: (request: EmulatorRequestEvent) => {
      return handleQueueRequest(service, options, context, request);
    }
  };
};

const handleQueueRequest = async (
  service: QueueService,
  options: ServeOptions,
  context: EmulateServiceContext,
  request: EmulatorRequestEvent
) => {
  const { method, path, body } = request;

  if (method !== 'POST' || path !== '/' || !body) {
    throw new Error('Unsupported queue request.');
  }

  try {
    const jsonMessage = JSON.parse(body.toString());
    const safeMessage = await getJsonMessage(jsonMessage, service.schema);

    await handleQueueMessage(service, options, context, safeMessage);

    return getSuccessResponse(201);
    //
  } catch (error) {
    if (!(error instanceof MalformedMessageError)) {
      throw error;
    }

    return getErrorResponse(400, {
      message: error.message,
      context: error.context
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
