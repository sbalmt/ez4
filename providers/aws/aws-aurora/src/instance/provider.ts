import { tryRegisterProvider } from '@ez4/aws-common';

import { getInstanceHandler } from './handler';
import { InstanceServiceType } from './types';

export const registerInstanceProvider = () => {
  tryRegisterProvider(InstanceServiceType, getInstanceHandler());
};
