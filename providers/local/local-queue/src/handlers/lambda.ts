import type { QueueImport, QueueService, QueueSubscription } from '@ez4/queue/library';
import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { Queue } from '@ez4/queue';

import { createModule, onBegin, onEnd, onError, onReady } from '@ez4/local-common';
import { getJsonMessage } from '@ez4/queue/utils';
import { Logger } from '@ez4/project/library';
import { getRandomUUID } from '@ez4/utils';

export const processLambdaMessage = async (
  service: QueueService | QueueImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  subscription: QueueSubscription,
  message: Buffer
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
    Logger.error(`${error}`);

    await onError(lambdaModule, lambdaContext, lambdaRequest, error);
    //
  } finally {
    await onEnd(lambdaModule, lambdaContext, lambdaRequest);
  }
};
