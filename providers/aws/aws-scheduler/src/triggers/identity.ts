import type { IdentityEvent } from '@ez4/project/library';

import { getIdentityAccount } from '@ez4/aws-function';
import { ServiceType } from '@ez4/scheduler/library';

export const prepareIdentityAccount = (event: IdentityEvent) => {
  const { serviceType } = event;

  if (serviceType !== ServiceType) {
    return null;
  }

  return [
    getIdentityAccount(),
    {
      account: 'scheduler.amazonaws.com'
    }
  ];
};
