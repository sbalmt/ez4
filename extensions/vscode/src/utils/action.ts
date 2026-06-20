import type { ManifestAction } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';

import { hashData } from '@ez4/utils';

export namespace ActionUtils {
  export const getId = (host: string, action: ManifestAction<AnyObject>) => {
    return hashData(host, action.name);
  };
}
