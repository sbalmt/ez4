import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { registerTriggers as registerSchemaTriggers } from '@ez4/schema/library';
import { createTrigger } from '@ez4/project/library';

import { ImportType } from '../types/import.js';
import { getNotificationImports } from '../metadata/import.js';

import { ServiceType } from '../types/service.js';
import { getNotificationServices } from '../metadata/service.js';

import { getLinkedService, getLinkedImport } from './link.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerCommonTriggers();
  registerSchemaTriggers();

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
