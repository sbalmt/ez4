import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { registerTriggers as registerSchemaTriggers } from '@ez4/schema/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { ImportType } from '../types/import';
import { ServiceType } from '../types/service';
import { getQueueServices } from '../metadata/service';
import { getQueueImports } from '../metadata/import';
import { getLinkedService, getLinkedImport } from './service';

export const registerTriggers = () => {
  registerCommonTriggers();
  registerSchemaTriggers();

  tryCreateTrigger(ServiceType, {
    'metadata:getServices': getQueueServices,
    'metadata:getLinkedService': getLinkedService
  });

  tryCreateTrigger(ImportType, {
    'metadata:getServices': getQueueImports,
    'metadata:getLinkedService': getLinkedImport
  });
};
