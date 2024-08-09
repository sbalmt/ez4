import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { registerTriggers as registerSchemaTriggers } from '@ez4/schema/library';
import { createTrigger } from '@ez4/project';

import { getDatabaseServices } from '../metadata/service.js';
import { applyRichTypeObject, applyRichTypePath } from './richtypes.js';
import { getLinkedService } from './service.js';

let isRegistered = false;

/**
 * Register all triggers.
 */
export const registerTriggers = () => {
  if (!isRegistered) {
    registerCommonTriggers();
    registerSchemaTriggers();

    createTrigger('@ez4/database', {
      'reflection:loadFile': applyRichTypePath,
      'reflection:typeObject': applyRichTypeObject,
      'metadata:getServices': getDatabaseServices,
      'metadata:getLinkedService': getLinkedService
    });

    isRegistered = true;
  }

  return isRegistered;
};
