import { registerProvider } from '@ez4/aws-common';

import { getAccessHandler } from './handler.js';
import { AccessServiceType } from './types.js';

export const registerAccessProvider = () => {
  registerProvider(AccessServiceType, getAccessHandler());
};
