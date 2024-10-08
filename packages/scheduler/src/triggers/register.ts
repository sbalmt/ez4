import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { createTrigger } from '@ez4/project/library';

import { getCronServices } from '../metadata/service.js';
import { getLinkedService } from '../metadata/linked.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerCommonTriggers();

  createTrigger('@ez4/scheduler', {
    'metadata:getServices': getCronServices,
    'metadata:getLinkedService': getLinkedService
  });

  isRegistered = true;
};
