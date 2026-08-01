import type { EmulateServiceContext, EmulatorRequestEvent, ServeOptions } from '@ez4/project/library';
import type { TopicImport } from '@ez4/topic/library';

import { getErrorResponse, getSuccessResponse } from '@ez4/local-common';
import { getServiceName, MissingImportedProjectError } from '@ez4/project/library';
import { getJsonEvent, MalformedEventError } from '@ez4/topic/utils';
import { TopicSubscriptionType } from '@ez4/topic/library';
import { Logger } from '@ez4/logger';

import { createRemoteClient, subscribeRemoteClient, unsubscribeRemoteClient } from '../client/remote';
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

  return {
    type: 'Topic',
    name: resourceName,
    identifier: getServiceName(resourceName, options),
    exportHandler: () => {
      return createRemoteClient(referenceName, eventSchema, clientOptions);
    },
    requestHandler: (request: EmulatorRequestEvent) => {
      return handleTopicRequest(service, options, context, request);
    },
    bootstrapHandler: async () => {
      if (options.suppress) {
        return Logger.warn(`Topic [${resourceName}] subscription is suppressed`);
      }

      const topicIdentifier = getServiceName(resourceName, options);
      const topicHost = getTopicServiceHost(options.serviceHost, topicIdentifier);

      await subscribeRemoteClient(referenceName, topicHost, clientOptions);
    },
    shutdownHandler: async () => {
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
  request: EmulatorRequestEvent
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
