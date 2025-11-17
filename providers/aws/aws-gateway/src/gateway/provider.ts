import { tryRegisterProvider } from '@ez4/aws-common';

import { getGatewayHandler } from './handler';
import { GatewayServiceType } from './types';

export const registerGatewayProvider = () => {
  tryRegisterProvider(GatewayServiceType, getGatewayHandler());
};
