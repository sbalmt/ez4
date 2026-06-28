import type { TopicService } from '@ez4/topic/library';

import { TopicSubscriptionType } from '@ez4/topic/library';
import { ManifestActionType } from '@ez4/project/library';
import { arrayUnique } from '@ez4/utils';

export namespace TopicManifest {
  export const build = (service: TopicService) => {
    const { subscriptions, schema, file } = service;

    const sources = arrayUnique(
      subscriptions.flatMap((subscriptions) => {
        if (subscriptions.type === TopicSubscriptionType.Lambda) {
          return subscriptions.handler.file;
        }

        return [];
      }),
      file ? [file] : []
    ).map((file) => ({
      file
    }));

    return {
      actions: [
        {
          type: ManifestActionType.Post,
          description: 'Send a message to all topic subscriptions.',
          name: 'sendMessage',
          path: '/',
          sources,
          request: {
            body: schema
          }
        }
      ]
    };
  };
}
