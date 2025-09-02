import type { TopicImport, TopicLambdaSubscription, TopicService } from '@ez4/topic/library';
import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { Topic } from '@ez4/topic';
import type { AnyObject } from '@ez4/utils';

import { createModule, onBegin, onEnd, onError, onReady } from '@ez4/local-common';
import { getRandomUUID } from '@ez4/utils';

export const processLambdaMessage = async (
  service: TopicService | TopicImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  subscription: TopicLambdaSubscription,
  message: AnyObject
) => {
  const lambdaModule = await createModule({
    listener: subscription.listener,
    handler: subscription.handler,
    version: options.version,
    variables: {
      ...options.variables,
      ...service.variables,
      ...subscription.variables
    }
  });

  const lambdaContext = service.services && context.makeClients(service.services);

  let currentRequest: Topic.Incoming<Topic.Message> | undefined;

  const lambdaRequest = {
    requestId: getRandomUUID()
  };

  try {
    await onBegin(lambdaModule, lambdaContext, lambdaRequest);

    currentRequest = {
      ...lambdaRequest,
      message
    };

    await onReady(lambdaModule, lambdaContext, currentRequest);
    await lambdaModule.handler(currentRequest, lambdaContext);
    //
  } catch (error) {
    await onError(lambdaModule, lambdaContext, currentRequest ?? lambdaRequest, error);
    //
  } finally {
    await onEnd(lambdaModule, lambdaContext, lambdaRequest);
  }
};
