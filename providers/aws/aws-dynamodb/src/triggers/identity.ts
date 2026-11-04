import type { IdentityEvent } from '@ez4/project/library';

import { getIdentityAccount } from '@ez4/aws-function';
import { ServiceType } from '@ez4/database/library';

import { hasDynamoDbStreams } from './utils';

export const prepareIdentityAccount = (event: IdentityEvent) => {
  const { serviceType, services } = event;

  if (serviceType !== ServiceType || !hasDynamoDbStreams(services)) {
    return null;
  }

  return [getIdentityAccount()];
};
