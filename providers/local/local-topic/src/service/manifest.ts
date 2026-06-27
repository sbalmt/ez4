import type { TopicService } from '@ez4/topic/library';

import { TopicSubscriptionType } from '@ez4/topic/library';
import { ManifestActionType } from '@ez4/project/library';

export namespace TopicManifest {
  export const build = (service: TopicService) => {
    const sources = service.subscriptions.flatMap((subscriptions) => {
      if (subscriptions.type !== TopicSubscriptionType.Lambda) {
        return [];
      }

      return {
        file: subscriptions.handler.file
      };
    });

    return {
      actions: [
        {
          type: ManifestActionType.Post,
          description: 'Send a message to all topic subscriptions.',
          name: 'sendMessage',
          path: '/',
          sources,
          request: {
            body: service.schema
          }
        }
      ]
    };
  };
}
