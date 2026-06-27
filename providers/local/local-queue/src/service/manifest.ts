import type { QueueService } from '@ez4/queue/library';

import { ManifestActionType } from '@ez4/project/library';

export namespace QueueManifest {
  export const build = (service: QueueService) => {
    const sources = service.subscriptions.map(({ handler }) => ({
      file: handler.file
    }));

    return {
      actions: [
        {
          type: ManifestActionType.Post,
          description: 'Send a message to the queue.',
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
