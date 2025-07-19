import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { Notification } from '@ez4/notification';

import type { NotificationImport, NotificationLambdaSubscription, NotificationService } from '@ez4/notification/library';

import { createModule, onBegin, onEnd, onError, onReady } from '@ez4/local-common';
import { getJsonMessage } from '@ez4/notification/utils';
import { Logger } from '@ez4/project/library';
import { getRandomUUID } from '@ez4/utils';

export const processLambdaMessage = async (
  service: NotificationService | NotificationImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  subscription: NotificationLambdaSubscription,
  message: Buffer
) => {
  const lambdaModule = await createModule({
    version: options.version,
    listener: subscription.listener,
    handler: subscription.handler,
    variables: {
      ...options.variables,
      ...service.variables,
      ...subscription.variables
    }
  });

  const lambdaContext = service.services && context.makeClients(service.services);

  const lambdaRequest: Partial<Notification.Incoming<Notification.Message>> = {
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
