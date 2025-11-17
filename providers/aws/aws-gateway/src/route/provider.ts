import { tryRegisterProvider } from '@ez4/aws-common';

import { getRouteHandler } from './handler';
import { RouteServiceType } from './types';

export const registerRouteProvider = () => {
  tryRegisterProvider(RouteServiceType, getRouteHandler());
};
