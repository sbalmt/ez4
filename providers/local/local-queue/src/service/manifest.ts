import type { QueueService } from '@ez4/queue/library';

import { ManifestActionType } from '@ez4/project/library';

export namespace QueueManifest {
  export const build = (service: QueueService) => {
    return {
      actions: [
        {
          type: ManifestActionType.Post,
          description: 'Send a message to the queue.',
          name: 'sendMessage',
          path: '/',
          request: {
            body: service.schema
          }
        }
      ]
    };
  };
}
