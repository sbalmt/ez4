import type { EmulateServiceContext, EmulatorServiceRequest, ServeOptions } from '@ez4/project/library';
import type { QueueImport, QueueService } from '@ez4/queue/library';
import type { AnyObject } from '@ez4/utils';
import type { ImportedClientOptions } from '../client/import';

import { getResponseError, getResponseSuccess } from '@ez4/local-common';
import { getServiceName, MissingImportedProjectError } from '@ez4/project/library';
import { getJsonMessage, MalformedMessageError } from '@ez4/queue/utils';
import { getRandomInteger } from '@ez4/utils';

import { processLambdaMessage } from '../handlers/lambda';
import { createServiceClient } from '../client/service';
import { createImportedClient } from '../client/import';

export const registerLocalQueueServices = (service: QueueService, options: ServeOptions, context: EmulateServiceContext) => {
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
    clientHandler: () => {
      return createServiceClient(serviceName, messageSchema, clientOptions);
    },
    requestHandler: (request: EmulatorServiceRequest) => {
      return handleQueueRequest(service, options, context, request);
    }
  };
};

export const registerImportedQueueServices = (service: QueueImport, options: ServeOptions) => {
  const { name: serviceName, reference: referenceName, schema: messageSchema, project } = service;
  const { imports } = options;

  if (!imports || !imports[project]) {
    throw new MissingImportedProjectError(project);
  }

  const clientOptions = {
    ...imports[project]
  };

  return {
    type: 'Queue',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    clientHandler: () => {
      return createImportedClient(referenceName, messageSchema, clientOptions);
    },
    requestHandler: (request: EmulatorServiceRequest) => {
      return handleQueueForward(service, clientOptions, request);
    }
  };
};

const handleQueueForward = async (service: QueueImport, options: ImportedClientOptions, request: EmulatorServiceRequest) => {
  const { reference: referenceName, schema: messageSchema } = service;

  const client = createImportedClient(referenceName, messageSchema, options);

  return client.sendMessage(JSON.parse(request.body!.toString()));
};

const handleQueueRequest = async (
  service: QueueService,
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
