import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { registerTriggers as registerSchemaTriggers } from '@ez4/schema/library';
import { createTrigger } from '@ez4/project/library';

import { getCronServices } from '../metadata/service.js';
import { getLinkedService } from '../metadata/linked.js';

let isRegistered = false;

/**
 * Register all triggers.
 */
export const registerTriggers = () => {
  if (!isRegistered) {
    registerCommonTriggers();
    registerSchemaTriggers();

    createTrigger('@ez4/scheduler', {
      'metadata:getServices': getCronServices,
      'metadata:getLinkedService': getLinkedService
    });

    isRegistered = true;
  }

  return isRegistered;
};