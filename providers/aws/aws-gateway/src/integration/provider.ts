import { tryRegisterProvider } from '@ez4/aws-common';

import { getIntegrationHandler } from './handler';
import { IntegrationServiceType } from './types';

export const registerIntegrationProvider = () => {
  tryRegisterProvider(IntegrationServiceType, getIntegrationHandler());
};
