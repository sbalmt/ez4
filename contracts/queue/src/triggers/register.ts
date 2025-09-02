import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { registerTriggers as registerSchemaTriggers } from '@ez4/schema/library';
import { createTrigger } from '@ez4/project/library';

import { ImportType } from '../types/import';
import { ServiceType } from '../types/service';
import { getQueueServices } from '../metadata/service';
import { getQueueImports } from '../metadata/import';
import { getLinkedService, getLinkedImport } from './service';

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
