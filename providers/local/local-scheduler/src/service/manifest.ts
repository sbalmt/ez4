import type { CronService } from '@ez4/scheduler/library';

import { ManifestActionType } from '@ez4/project/library';

export namespace CronManifest {
  export const build = (service: CronService) => {
    const { handler } = service.target;

    return {
      actions: [
        {
          type: ManifestActionType.Post,
          description: 'Trigger the event immediately.',
          body: service.schema,
          name: handler.name
        }
      ]
    };
  };
}
