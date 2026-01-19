import type { CommonOptions } from '@ez4/project/library';
import type { MessageSchema } from '@ez4/topic/utils';
import type { Client, Topic } from '@ez4/topic';

import { getJsonStringMessage } from '@ez4/topic/utils';
import { getServiceName } from '@ez4/project/library';
import { Logger } from '@ez4/logger';

import { getTopicServiceHost, sendTopicServiceRequest } from '../utils/topic';

export type RemoteClientOptions = CommonOptions & {
  serviceHost: string;
};

export const createRemoteClient = <T extends Topic.Message = any>(
  serviceName: string,
  messageSchema: MessageSchema,
  clientOptions: RemoteClientOptions
): Client<T> => {
  const topicIdentifier = getServiceName(serviceName, clientOptions);
  const topicHost = getTopicServiceHost(clientOptions.serviceHost, topicIdentifier);

  return new (class {
    async sendMessage(message: T) {
      Logger.debug(`✉️  Sending message to topic [${serviceName}] at ${topicHost}`);

      const payload = await getJsonStringMessage(message, messageSchema);

      setImmediate(async () => {
        try {
          await sendTopicServiceRequest(topicHost, payload);
        } catch (error) {
          Logger.error(`Remote topic [${serviceName}] at ${topicHost} isn't available.`);
          Logger.error(`    ${error}`);
        }
      });
    }
  })();
};

export const unsubscribeRemoteClient = async (serviceName: string, clientOptions: RemoteClientOptions) => {
  const topicIdentifier = getServiceName(serviceName, clientOptions);
  const topicHost = getTopicServiceHost(clientOptions.serviceHost, topicIdentifier);

  try {
    await sendTopicServiceRequest(
      `${topicHost}/unsubscribe`,
      JSON.stringify({
        serviceName
      })
    );

    Logger.log(`⛔ Unsubscribed from topic [${serviceName}] at ${topicHost}`);
    //
  } catch {
    // Suppress unsubscription errors.
  }
};

export const subscribeRemoteClient = async (serviceName: string, remoteHost: string, clientOptions: RemoteClientOptions) => {
  const topicIdentifier = getServiceName(serviceName, clientOptions);
  const topicHost = getTopicServiceHost(clientOptions.serviceHost, topicIdentifier);

  try {
    await sendTopicServiceRequest(
      `${topicHost}/subscribe`,
      JSON.stringify({
        serviceHost: remoteHost,
        serviceName
      })
    );

    Logger.log(`✉️  Subscribed to topic [${serviceName}] at ${topicHost}`);
    //
  } catch {
    Logger.warn(`Remote topic [${serviceName}] at ${topicHost} isn't available.`);
  }
};
