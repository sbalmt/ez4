import { registerProvider } from '@ez4/aws-common';

import { getInstanceHandler } from './handler';
import { InstanceServiceType } from './types';

export const registerInstanceProvider = () => {
  registerProvider(InstanceServiceType, getInstanceHandler());
};
