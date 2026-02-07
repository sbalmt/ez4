import { tryRegisterProvider } from '@ez4/aws-common';

import { getIdentityHandler } from './handler';
import { IdentityServiceType } from './types';

export const registerIdentityProvider = () => {
  tryRegisterProvider(IdentityServiceType, getIdentityHandler());
};
