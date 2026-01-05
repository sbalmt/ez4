import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { getBucketServicesMetadata } from '../metadata/service';
import { getLinkedService } from './service';

export const registerTriggers = () => {
  registerCommonTriggers();

  tryCreateTrigger('@ez4/bucket', {
    'metadata:getServices': getBucketServicesMetadata,
    'metadata:getLinkedService': getLinkedService
  });
};
