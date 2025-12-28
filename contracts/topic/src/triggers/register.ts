import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { registerTriggers as registerSchemaTriggers } from '@ez4/schema/library';
import { registerTriggers as registerQueueTriggers } from '@ez4/queue/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { getTopicImportsMetadata } from '../metadata/import';
import { getTopicServicesMetadata } from '../metadata/service';
import { ServiceType, ImportType } from '../metadata/types';
import { getLinkedService, getLinkedImport } from './service';

export const registerTriggers = () => {
  registerCommonTriggers();
  registerSchemaTriggers();
  registerQueueTriggers();

  tryCreateTrigger(ServiceType, {
    'metadata:getServices': getTopicServicesMetadata,
    'metadata:getLinkedService': getLinkedService
  });

  tryCreateTrigger(ImportType, {
    'metadata:getServices': getTopicImportsMetadata,
    'metadata:getLinkedService': getLinkedImport
  });
};
