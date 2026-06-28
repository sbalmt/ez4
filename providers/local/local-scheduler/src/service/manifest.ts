import type { CronService } from '@ez4/scheduler/library';

import { ManifestActionType } from '@ez4/project/library';
import { arrayUnique } from '@ez4/utils';

export namespace CronManifest {
  export const build = (service: CronService) => {
    const { target, schema, file } = service;
    const { handler } = target;

    const sources = arrayUnique([handler.file], file ? [file] : []).map((file) => ({
      file
    }));

    return {
      actions: [
        {
          type: ManifestActionType.Post,
          description: 'Trigger the event immediately.',
          name: handler.name,
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
