import type { NotificationImport, NotificationQueueSubscription, NotificationService } from '@ez4/notification/library';
import type { EmulateServiceContext } from '@ez4/project/library';
import type { Client as QueueClient } from '@ez4/queue';

import { getJsonMessage } from '@ez4/notification/utils';
import { Logger } from '@ez4/project/library';

export const processQueueMessage = async (
  service: NotificationService | NotificationImport,
  context: EmulateServiceContext,
  subscription: NotificationQueueSubscription,
  message: Buffer
) => {
  try {
    const jsonMessage = JSON.parse(message.toString());
    const safeMessage = await getJsonMessage(jsonMessage, service.schema);

    const queueClient = context.makeClient(subscription.service) as QueueClient<any>;

    await queueClient.sendMessage(safeMessage);
    //
  } catch (error) {
    Logger.error(`${error}`);
  }
};
