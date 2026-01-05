import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { registerTriggers as registerSchemaTriggers } from '@ez4/schema/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { getQueueImportsMetadata } from '../metadata/import';
import { getQueueServicesMetadata } from '../metadata/service';
import { ImportType, ServiceType } from '../metadata/types';
import { getLinkedService, getLinkedImport } from './service';

export const registerTriggers = () => {
  registerCommonTriggers();
  registerSchemaTriggers();

  tryCreateTrigger(ServiceType, {
    'metadata:getServices': getQueueServicesMetadata,
    'metadata:getLinkedService': getLinkedService
  });

  tryCreateTrigger(ImportType, {
    'metadata:getServices': getQueueImportsMetadata,
    'metadata:getLinkedService': getLinkedImport
  });
};
