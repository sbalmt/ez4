import type { EmulateServiceContext, EmulatorRequestEvent, ServeOptions, ServiceEmulator } from '@ez4/project/library';
import type { QueueImport, QueueService } from '@ez4/queue/library';
import type { AnyObject } from '@ez4/utils';
import type { ProviderMessageEvent } from '../types/events';

import { registerProvider, unregisterProvider } from '@ez4/emulator';
import { getErrorResponse, getSuccessResponse } from '@ez4/local-common';
import { MalformedMessageError } from '@ez4/queue/utils';
import { getServiceName } from '@ez4/project/library';
import { getRandomInteger } from '@ez4/utils';

import { processLambdaMessage } from '../handlers/lambda';
import { QueueManifest } from '../service/manifest';
import { ProviderEvent } from '../types/events';

export const registerLocalService = (service: QueueService, options: ServeOptions, context: EmulateServiceContext): ServiceEmulator => {
  const { name: resourceName, schema } = service;

  const identifier = getServiceName(resourceName, options);
  const provider = `queue:${identifier}`;

  return {
    type: 'Queue',
    name: resourceName,
    options: service.options,
    identifier,
    bootstrapHandler: () => {
      registerProvider(provider, {
        eventTypes: [ProviderEvent.PutMessage],
        eventHandler: (_event: string, payload: ProviderMessageEvent | undefined) => {
          if (!payload) {
            throw new Error('Missing queue event payload.');
          }

          const { message, delay = service.backoff?.minDelay ?? 0 } = payload;

          setTimeout(() => handleQueueMessage(service, options, context, message), delay * 1000);
        }
      });
    },
    shutdownHandler: () => {
      unregisterProvider(provider);
    },
    exportDescriptor: () => {
      return {
        name: 'makeLocalService',
        module: '@ez4/local-queue/worker',
        provider,
        options: {
          delay: service.delay ?? 0,
          identifier,
          schema
        }
      };
    },
    requestHandler: (request: EmulatorRequestEvent) => {
      return handleQueueRequest(service, options, context, request);
    },
    manifestHandler: () => {
      return QueueManifest.build(service);
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

    await handleQueueMessage(service, options, context, jsonMessage);

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
