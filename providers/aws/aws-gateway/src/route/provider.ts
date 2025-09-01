import { registerProvider } from '@ez4/aws-common';

import { getRouteHandler } from './handler';
import { RouteServiceType } from './types';

export const registerRouteProvider = () => {
  registerProvider(RouteServiceType, getRouteHandler());
};
