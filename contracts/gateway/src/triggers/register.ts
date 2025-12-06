import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { registerTriggers as registerSchemaTriggers } from '@ez4/schema/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { ImportType } from '../types/import';
import { ServiceType } from '../types/service';
import { getHttpImports } from '../metadata/import';
import { getLinkedImport, getLinkedService, getServices } from './service';

export const registerTriggers = () => {
  registerCommonTriggers();
  registerSchemaTriggers();

  tryCreateTrigger(ServiceType, {
    'metadata:getServices': getServices,
    'metadata:getLinkedService': getLinkedService
  });

  tryCreateTrigger(ImportType, {
    'metadata:getServices': getHttpImports,
    'metadata:getLinkedService': getLinkedImport
  });
};
