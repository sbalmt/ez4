import { registerProvider } from '@ez4/aws-common';

import { getIntegrationHandler } from './handler';
import { IntegrationServiceType } from './types';

export const registerIntegrationProvider = () => {
  registerProvider(IntegrationServiceType, getIntegrationHandler());
};
