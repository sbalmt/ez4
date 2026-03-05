import { tryRegisterProvider } from '@ez4/aws-common';

import { getIntegrityHandler } from './handler';
import { IntegrityServiceType } from './types';

export const registerIntegrityProvider = () => {
  tryRegisterProvider(IntegrityServiceType, getIntegrityHandler());
};
