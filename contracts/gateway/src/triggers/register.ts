import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { registerTriggers as registerSchemaTriggers } from '@ez4/schema/library';
import { createTrigger } from '@ez4/project/library';

import { getHttpServices } from '../metadata/service';
import { getLinkedService } from './service';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerCommonTriggers();
  registerSchemaTriggers();

  createTrigger('@ez4/gateway', {
    'metadata:getServices': getHttpServices,
    'metadata:getLinkedService': getLinkedService
  });

  isRegistered = true;
};
