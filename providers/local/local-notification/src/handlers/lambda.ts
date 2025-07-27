import type { NotificationImport, NotificationLambdaSubscription, NotificationService } from '@ez4/notification/library';
import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { Notification } from '@ez4/notification';
import type { AnyObject } from '@ez4/utils';

import { createModule, onBegin, onEnd, onError, onReady } from '@ez4/local-common';
import { getRandomUUID } from '@ez4/utils';

export const processLambdaMessage = async (
  service: NotificationService | NotificationImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  subscription: NotificationLambdaSubscription,
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

  let currentRequest: Notification.Incoming<Notification.Message> | undefined;

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
