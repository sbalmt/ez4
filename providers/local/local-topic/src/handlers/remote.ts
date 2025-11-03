import type { AnyObject } from '@ez4/utils';
import type { TopicRemoteSubscription } from '../types/subscription';

import { Logger } from '@ez4/project/library';

export const processRemoteMessage = async (subscription: TopicRemoteSubscription, message: AnyObject) => {
  const { serviceName, serviceHost } = subscription;

  try {
    const response = await fetch(serviceHost, {
      method: 'POST',
      body: JSON.stringify(message),
      headers: {
        ['content-type']: 'application/json'
      }
    });

    if (!response.ok) {
      const { message } = await response.json();

      throw new Error(message);
    }
  } catch (error) {
    Logger.error(`Remote subscription [${serviceName}] at ${serviceHost} isn't available.`);
    Logger.error(`    ${error}`);
  }
};
