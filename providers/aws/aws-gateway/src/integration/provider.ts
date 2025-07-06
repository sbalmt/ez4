import { registerProvider } from '@ez4/aws-common';

import { getIntegrationHandler } from './handler.js';
import { IntegrationServiceType } from './types.js';

export const registerIntegrationProvider = () => {
  registerProvider(IntegrationServiceType, getIntegrationHandler());
};
