import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { registerTriggers as registerStorageTriggers } from '@ez4/storage/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { getCdnServicesMetadata } from '../metadata/service';

export const registerTriggers = () => {
  registerCommonTriggers();
  registerStorageTriggers();

  tryCreateTrigger('@ez4/distribution', {
    'metadata:getServices': getCdnServicesMetadata
  });
};
