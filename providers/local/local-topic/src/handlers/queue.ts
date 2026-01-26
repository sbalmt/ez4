import type { TopicQueueSubscription } from '@ez4/topic/library';
import type { EmulateServiceContext } from '@ez4/project/library';
import type { Client as QueueClient } from '@ez4/queue';
import type { AnyObject } from '@ez4/utils';

import { Logger } from '@ez4/logger';

export const processQueueMessage = async (context: EmulateServiceContext, subscription: TopicQueueSubscription, message: AnyObject) => {
  try {
    const queueClient = (await context.makeClient(subscription.service)) as QueueClient<any>;

    await queueClient.sendMessage(message);
    //
  } catch (error) {
    Logger.error(`${error}`);
  }
};
