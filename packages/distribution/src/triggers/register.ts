import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { createTrigger } from '@ez4/project/library';

import { getCdnServices } from '../metadata/service.js';

let isRegistered = false;

/**
 * Register all triggers.
 */
export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerCommonTriggers();

  createTrigger('@ez4/distribution', {
    'metadata:getServices': getCdnServices
  });

  isRegistered = true;
};
