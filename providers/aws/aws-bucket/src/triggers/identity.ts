import type { IdentityEvent } from '@ez4/project/library';

import { getIdentityAccount } from '@ez4/aws-function';
import { ServiceType } from '@ez4/storage/library';

import { hasBucketEvents } from './utils';

export const prepareIdentityAccount = (event: IdentityEvent) => {
  const { serviceType, services } = event;

  if (serviceType !== ServiceType) {
    return null;
  }

  if (!hasBucketEvents(services)) {
    return null;
  }

  return [getIdentityAccount()];
};
