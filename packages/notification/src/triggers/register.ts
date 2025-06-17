import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { registerTriggers as registerSchemaTriggers } from '@ez4/schema/library';
import { registerTriggers as registerQueueTriggers } from '@ez4/queue/library';
import { createTrigger } from '@ez4/project/library';

import { ImportType } from '../types/import.js';
import { getNotificationImports } from '../metadata/import.js';

import { ServiceType } from '../types/service.js';
import { getNotificationServices } from '../metadata/service.js';
import { getLinkedService, getLinkedImport } from './service.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerCommonTriggers();
  registerSchemaTriggers();
  registerQueueTriggers();

  createTrigger(ServiceType, {
    'metadata:getServices': getNotificationServices,
    'metadata:getLinkedService': getLinkedService
  });

  createTrigger(ImportType, {
    'metadata:getServices': getNotificationImports,
    'metadata:getLinkedService': getLinkedImport
  });

  isRegistered = true;
};
