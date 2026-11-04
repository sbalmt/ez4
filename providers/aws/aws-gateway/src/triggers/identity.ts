import type { IdentityEvent } from '@ez4/project/library';

import { getIdentityAccount } from '@ez4/aws-function';

import { hasGatewayLambdaServices } from './utils/lambda';

export const prepareIdentityAccount = (event: IdentityEvent) => {
  const { services } = event;

  if (!hasGatewayLambdaServices(services)) {
    return null;
  }

  return [getIdentityAccount()];
};
