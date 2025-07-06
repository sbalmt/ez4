import { registerProvider } from '@ez4/aws-common';

import { getRouteHandler } from './handler.js';
import { RouteServiceType } from './types.js';

export const registerRouteProvider = () => {
  registerProvider(RouteServiceType, getRouteHandler());
};
