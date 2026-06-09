import type { CronService } from '@ez4/scheduler/library';

import { ManifestActionType } from '@ez4/project/library';

export namespace CronManifest {
  export const build = (service: CronService) => {
    return {
      actions: [
        {
          type: ManifestActionType.Post,
          body: service.schema,
          name: 'Trigger event'
        }
      ]
    };
  };
}
