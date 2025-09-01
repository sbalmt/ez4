import { registerProvider } from '@ez4/aws-common';

import { getGatewayHandler } from './handler';
import { GatewayServiceType } from './types';

export const registerGatewayProvider = () => {
  registerProvider(GatewayServiceType, getGatewayHandler());
};
