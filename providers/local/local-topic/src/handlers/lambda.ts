import type { TopicImport, TopicLambdaSubscription, TopicService } from '@ez4/topic/library';
import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';
import type { Topic } from '@ez4/topic';

import { createModule, onBegin, onReady, onDone, onError, onEnd } from '@ez4/local-common';
import { getRandomUUID } from '@ez4/utils';

export const processLambdaMessage = async (
  service: TopicService | TopicImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  subscription: TopicLambdaSubscription,
  message: AnyObject
) => {
  const module = await createModule({
    listener: subscription.listener,
    handler: subscription.handler,
    version: options.version,
    variables: {
      ...options.variables,
      ...service.variables,
      ...subscription.variables
    }
  });

  const { services } = service;

  const clients = services && (await context.makeClients(services));

  let currentRequest: Topic.Incoming<Topic.Message> | undefined;

  const request = {
    requestId: getRandomUUID()
  };

  try {
    await onBegin(module, clients, request);

    currentRequest = {
      ...request,
      message
    };

    await onReady(module, clients, currentRequest);
    await module.handler(currentRequest, clients);
    await onDone(module, clients, currentRequest);
    //
  } catch (error) {
    await onError(module, clients, currentRequest ?? request, error);
    //
  } finally {
    await onEnd(module, clients, request);
  }
};
