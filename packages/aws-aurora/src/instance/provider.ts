import { registerProvider } from '@ez4/aws-common';

import { getInstanceHandler } from './handler.js';
import { InstanceServiceType } from './types.js';

export const registerInstanceProvider = () => {
  registerProvider(InstanceServiceType, getInstanceHandler());
};
