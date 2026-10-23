import type { TopicImport, TopicService, TopicSubscription } from '@ez4/topic/library';
import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';
import type { TopicRemoteSubscription } from '../types/subscription';

import { TopicSubscriptionType } from '@ez4/topic/library';
import { Logger } from '@ez4/logger';

import { TopicEmulatorSubscriptionType } from '../types/subscription';
import { processRemoteEvent } from './remote';
import { processLambdaEvent } from './lambda';
import { processQueueEvent } from './queue';

export const processTopicEvent = async (
  service: TopicService | TopicImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  event: AnyObject,
  subscriptions: (TopicSubscription | TopicRemoteSubscription)[] = service.subscriptions
) => {
  const operations = subscriptions.map(async (subscription) => {
    try {
      switch (subscription.type) {
        case TopicSubscriptionType.Lambda:
          await processLambdaEvent(service, options, context, subscription, event);
          break;

        case TopicSubscriptionType.Queue:
          await processQueueEvent(context, subscription, event);
          break;

        case TopicEmulatorSubscriptionType.Remote:
          await processRemoteEvent(subscription, event);
          break;
      }
    } catch (error) {
      Logger.error(`Topic [${service.name}] failed to process event:`);
      Logger.error(`  ${error}`);
    }
  });

  await Promise.all(operations);
};
