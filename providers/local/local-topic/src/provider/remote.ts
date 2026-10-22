import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { TopicImport } from '@ez4/topic/library';
import type { HttpProviderRequest } from '@ez4/server';

import { getServiceName, MissingImportedProjectError } from '@ez4/project/library';
import {
  getErrorResponse,
  getSuccessResponse,
  ProviderType,
  registerProvider as registerServerProvider,
  unregisterProvider as unregisterServerProvider
} from '@ez4/server';
import { getJsonEvent, MalformedEventError } from '@ez4/topic/utils';
import { TopicSubscriptionType } from '@ez4/topic/library';
import { Logger } from '@ez4/logger';

import { subscribeRemoteClient, unsubscribeRemoteClient } from '../client/remote';
import { processLambdaEvent } from '../handlers/lambda';
import { processQueueEvent } from '../handlers/queue';
import { getTopicServiceHost } from '../utils/topic';

export const registerRemoteService = (service: TopicImport, options: ServeOptions, context: EmulateServiceContext) => {
  const { name: resourceName, reference: referenceName, schema: eventSchema, project } = service;
  const { imports } = options;

  if (!imports || !imports[project]) {
    throw new MissingImportedProjectError(project);
  }

  const clientOptions = {
    ...imports[project],
    remoteHost: options.serviceHost,
    remoteName: resourceName
  };

  const identifier = getServiceName(resourceName, options);

  return {
    type: 'Topic',
    name: resourceName,
    options: service.options,
    identifier,
    exportDescriptor: () => ({
      name: 'makeRemoteService',
      module: '@ez4/local-topic/worker',
      options: {
        resourceName: referenceName,
        schema: eventSchema,
        clientOptions
      }
    }),
    bootstrapHandler: async () => {
      registerServerProvider(identifier, {
        type: ProviderType.Http,
        requestHandler: (request) => {
          return handleTopicRequest(service, options, context, request);
        }
      });

      if (options.suppress) {
        return Logger.warn(`Topic [${resourceName}] subscription is suppressed`);
      }

      const topicHost = getTopicServiceHost(options.serviceHost, identifier);

      await subscribeRemoteClient(referenceName, topicHost, clientOptions);
    },
    shutdownHandler: async () => {
      unregisterServerProvider(identifier);

      if (!options.suppress) {
        await unsubscribeRemoteClient(referenceName, clientOptions);
      }
    }
  };
};

const handleTopicRequest = async (
  service: TopicImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  request: HttpProviderRequest
) => {
  const { method, path, body } = request;

  if (method !== 'POST' || path !== '/' || !body) {
    throw new Error('Unsupported topic request.');
  }

  try {
    const jsonEvent = JSON.parse(body.toString());
    const safeEvent = await getJsonEvent(jsonEvent, service.schema);

    const allSubscriptions = service.subscriptions.map((subscription) => {
      switch (subscription.type) {
        case TopicSubscriptionType.Lambda:
          return processLambdaEvent(service, options, context, subscription, safeEvent);

        case TopicSubscriptionType.Queue:
          return processQueueEvent(context, subscription, safeEvent);
      }
    });

    await Promise.all(allSubscriptions);

    return getSuccessResponse(201);
    //
  } catch (error) {
    if (!(error instanceof MalformedEventError)) {
      throw error;
    }

    return getErrorResponse(400, {
      message: error.message,
      context: error.context
    });
  }
};
