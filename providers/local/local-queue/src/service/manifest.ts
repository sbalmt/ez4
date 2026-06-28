import type { QueueService } from '@ez4/queue/library';

import { ManifestActionType } from '@ez4/project/library';
import { arrayUnique } from '@ez4/utils';

export namespace QueueManifest {
  export const build = (service: QueueService) => {
    const { subscriptions, schema, file } = service;

    const sources = arrayUnique(
      subscriptions.map(({ handler }) => handler.file),
      [file]
    ).map((file) => ({
      file
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
            body: schema
          }
        }
      ]
    };
  };
}
