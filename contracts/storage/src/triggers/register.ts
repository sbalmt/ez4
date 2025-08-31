import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { createTrigger } from '@ez4/project/library';

import { getBucketServices } from '../metadata/service.js';
import { getLinkedService } from './service.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerCommonTriggers();

  createTrigger('@ez4/bucket', {
    'metadata:getServices': getBucketServices,
    'metadata:getLinkedService': getLinkedService
  });

  isRegistered = true;
};
