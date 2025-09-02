import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { registerTriggers as registerSchemaTriggers } from '@ez4/schema/library';
import { registerTriggers as registerQueueTriggers } from '@ez4/queue/library';
import { createTrigger } from '@ez4/project/library';

import { ImportType } from '../types/import';
import { getTopicImports } from '../metadata/import';

import { ServiceType } from '../types/service';
import { getTopicServices } from '../metadata/service';
import { getLinkedService, getLinkedImport } from './service';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerCommonTriggers();
  registerSchemaTriggers();
  registerQueueTriggers();

  createTrigger(ServiceType, {
    'metadata:getServices': getTopicServices,
    'metadata:getLinkedService': getLinkedService
  });

  createTrigger(ImportType, {
    'metadata:getServices': getTopicImports,
    'metadata:getLinkedService': getLinkedImport
  });

  isRegistered = true;
};
