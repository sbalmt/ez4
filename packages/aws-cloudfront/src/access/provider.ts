import { registerProvider } from '@ez4/aws-common';

import { getAccessHandler } from './handler.js';
import { AccessServiceType } from './types.js';

export const registerOriginAccessProvider = () => {
  registerProvider(AccessServiceType, getAccessHandler());
};
