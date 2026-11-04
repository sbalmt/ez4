import type { IdentityEvent } from '@ez4/project/library';

import { getIdentityAccount } from '@ez4/aws-function';
import { ImportType, ServiceType } from '@ez4/topic/library';

import { hasTopicLambdaSubscriptions } from './utils';

export const prepareIdentityAccount = (event: IdentityEvent) => {
  const { serviceType, services } = event;

  if (serviceType !== ServiceType && serviceType !== ImportType) {
    return null;
  }

  if (!hasTopicLambdaSubscriptions(services)) {
    return null;
  }

  return [getIdentityAccount()];
};
