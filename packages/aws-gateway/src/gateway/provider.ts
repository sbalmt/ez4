import { registerProvider } from '@ez4/aws-common';

import { getGatewayHandler } from './handler.js';
import { GatewayServiceType } from './types.js';

export const registerGatewayProvider = () => {
  registerProvider(GatewayServiceType, getGatewayHandler());
};
