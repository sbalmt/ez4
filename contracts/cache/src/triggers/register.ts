import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { getCacheServicesMetadata } from '../metadata/service';
import { ServiceType } from '../metadata/types';
import { getLinkedService } from './service';

export const registerTriggers = () => {
  registerCommonTriggers();

  tryCreateTrigger(ServiceType, {
    'metadata:getServices': getCacheServicesMetadata,
    'metadata:getLinkedService': getLinkedService
  });
};
