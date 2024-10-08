import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { registerTriggers as registerSchemaTriggers } from '@ez4/schema/library';
import { createTrigger } from '@ez4/project/library';

import { getDatabaseServices } from '../metadata/service.js';
import { getLinkedService } from './service.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerCommonTriggers();
  registerSchemaTriggers();

  createTrigger('@ez4/database', {
    'metadata:getServices': getDatabaseServices,
    'metadata:getLinkedService': getLinkedService
  });

  isRegistered = true;
};
