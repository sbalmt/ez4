import type { BucketService } from '@ez4/storage/library';

import { ManifestActionType } from '@ez4/project/library';

export namespace BucketManifest {
  export const build = (_service: BucketService) => {
    return {
      actions: [
        {
          type: ManifestActionType.Head,
          name: 'File stat'
        },
        {
          type: ManifestActionType.Put,
          name: 'Write file'
        },
        {
          type: ManifestActionType.Get,
          name: 'Read file'
        }
      ]
    };
  };
}
