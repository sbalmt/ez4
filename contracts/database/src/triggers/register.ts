import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { registerTriggers as registerSchemaTriggers } from '@ez4/schema/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { getDatabaseServices } from '../metadata/service';
import { getLinkedService } from './service';

export const registerTriggers = () => {
  registerCommonTriggers();
  registerSchemaTriggers();

  tryCreateTrigger('@ez4/database', {
    'metadata:getServices': getDatabaseServices,
    'metadata:getLinkedService': getLinkedService
  });
};
