import type { CommonOptions } from '@ez4/project/library';
import type { MessageSchema } from '@ez4/topic/utils';
import type { Client, Topic } from '@ez4/topic';

import { getJsonStringMessage } from '@ez4/topic/utils';
import { getServiceName } from '@ez4/project/library';
import { Logger } from '@ez4/logger';

import { getTopicServiceHost, sendTopicServiceRequest, subscribeToTopicService, unsubscribeFromTopicService } from '../utils/topic';

export type RemoteClientOptions = CommonOptions & {
  serviceHost: string;
};

export const createRemoteClient = <T extends Topic.Message = any>(
  resourceName: string,
  messageSchema: MessageSchema,
  clientOptions: RemoteClientOptions
): Client<T> => {
  const topicIdentifier = getServiceName(resourceName, clientOptions);
  const topicHost = getTopicServiceHost(clientOptions.serviceHost, topicIdentifier);

  return new (class {
    async sendMessage(message: T) {
      Logger.log(`✉️  Sending message to topic [${resourceName}] at ${topicHost}.`);

      const payload = await getJsonStringMessage(message, messageSchema);

      setImmediate(async () => {
        try {
          await sendTopicServiceRequest(topicHost, payload);
        } catch (error) {
          Logger.error(`Remote topic [${resourceName}] at ${topicHost} isn't available.`);
          Logger.error(`    ${error}`);
        }
      });
    }
  })();
};

export const unsubscribeRemoteClient = async (resourceName: string, clientOptions: RemoteClientOptions) => {
  const topicIdentifier = getServiceName(resourceName, clientOptions);
  const topicHost = getTopicServiceHost(clientOptions.serviceHost, topicIdentifier);

  try {
    await unsubscribeFromTopicService(topicHost, {
      resourceName
    });

    Logger.log(`⛔ Unsubscribed from topic [${resourceName}] at ${topicHost}`);
    //
  } catch {
    // Suppress unsubscription errors.
  }
};

export const subscribeRemoteClient = async (resourceName: string, remoteHost: string, clientOptions: RemoteClientOptions) => {
  const topicIdentifier = getServiceName(resourceName, clientOptions);
  const topicHost = getTopicServiceHost(clientOptions.serviceHost, topicIdentifier);

  try {
    await subscribeToTopicService(topicHost, {
      serviceHost: remoteHost,
      resourceName
    });

    Logger.log(`✉️  Subscribed to topic [${resourceName}] at ${topicHost}`);
    //
  } catch {
    Logger.warn(`Remote topic [${resourceName}] at ${topicHost} isn't available.`);
  }
};
