import type { TopicQueueSubscription } from '@ez4/topic/library';
import type { EmulateServiceContext } from '@ez4/project/library';
import type { Client as QueueClient } from '@ez4/queue';
import type { AnyObject } from '@ez4/utils';

import { Logger } from '@ez4/logger';

export const processQueueEvent = async (context: EmulateServiceContext, subscription: TopicQueueSubscription, event: AnyObject) => {
  try {
    const queueClient = context.makeClient(subscription.service) as QueueClient<any, any>;

    await queueClient.sendMessage(event);
    //
  } catch (error) {
    Logger.error(`${error}`);
  }
};
