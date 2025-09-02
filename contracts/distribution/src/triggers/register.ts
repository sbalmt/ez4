import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { registerTriggers as registerStorageTriggers } from '@ez4/storage/library';
import { createTrigger } from '@ez4/project/library';

import { getCdnServices } from '../metadata/service';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerCommonTriggers();
  registerStorageTriggers();

  createTrigger('@ez4/distribution', {
    'metadata:getServices': getCdnServices
  });

  isRegistered = true;
};
