import type { TopicService } from '@ez4/topic/library';

import { ManifestActionType } from '@ez4/project/library';

export namespace TopicManifest {
  export const build = (service: TopicService) => {
    return {
      actions: [
        {
          type: ManifestActionType.Post,
          body: service.schema,
          description: 'Send a message to all topic subscriptions.',
          name: 'sendMessage'
        }
      ]
    };
  };
}
