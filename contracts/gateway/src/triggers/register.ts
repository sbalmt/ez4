import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { registerTriggers as registerSchemaTriggers } from '@ez4/schema/library';
import { createTrigger } from '@ez4/project/library';

import { ImportType } from '../types/import';
import { ServiceType } from '../types/service';
import { getHttpServices } from '../metadata/service';
import { getHttpImports } from '../metadata/import';
import { getLinkedImport, getLinkedService } from './service';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerCommonTriggers();
  registerSchemaTriggers();

  createTrigger(ServiceType, {
    'metadata:getServices': getHttpServices,
    'metadata:getLinkedService': getLinkedService
  });

  createTrigger(ImportType, {
    'metadata:getServices': getHttpImports,
    'metadata:getLinkedService': getLinkedImport
  });

  isRegistered = true;
};
