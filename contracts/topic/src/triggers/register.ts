import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { registerTriggers as registerSchemaTriggers } from '@ez4/schema/library';
import { registerTriggers as registerQueueTriggers } from '@ez4/queue/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { getTopicImports } from '../metadata/import';
import { ImportType } from '../types/import';

import { ServiceType } from '../types/service';
import { getTopicServices } from '../metadata/service';
import { getLinkedService, getLinkedImport } from './service';

export const registerTriggers = () => {
  registerCommonTriggers();
  registerSchemaTriggers();
  registerQueueTriggers();

  tryCreateTrigger(ServiceType, {
    'metadata:getServices': getTopicServices,
    'metadata:getLinkedService': getLinkedService
  });

  tryCreateTrigger(ImportType, {
    'metadata:getServices': getTopicImports,
    'metadata:getLinkedService': getLinkedImport
  });
};
