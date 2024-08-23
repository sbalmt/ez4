import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { registerTriggers as registerSchemaTriggers } from '@ez4/schema/library';
import { createTrigger } from '@ez4/project/library';

import { getHttpServices } from '../metadata/service.js';

let isRegistered = false;

/**
 * Register all triggers.
 */
export const registerTriggers = () => {
  if (!isRegistered) {
    registerCommonTriggers();
    registerSchemaTriggers();

    createTrigger('@ez4/gateway', {
      'metadata:getServices': getHttpServices
    });

    isRegistered = false;
  }

  return isRegistered;
};
