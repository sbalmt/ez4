import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { registerTriggers as registerSchemaTriggers } from '@ez4/schema/library';
import { createTrigger } from '@ez4/project/library';

import { ImportType } from '../types/import.js';
import { ServiceType } from '../types/service.js';
import { getQueueServices } from '../metadata/service.js';
import { getQueueImports } from '../metadata/import.js';
import { getLinkedService, getLinkedImport } from './service.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerCommonTriggers();
  registerSchemaTriggers();

  createTrigger(ServiceType, {
    'metadata:getServices': getQueueServices,
    'metadata:getLinkedService': getLinkedService
  });

  createTrigger(ImportType, {
    'metadata:getServices': getQueueImports,
    'metadata:getLinkedService': getLinkedImport
  });

  isRegistered = true;
};
