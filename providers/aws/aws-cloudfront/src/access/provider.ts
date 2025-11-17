import { tryRegisterProvider } from '@ez4/aws-common';

import { getAccessHandler } from './handler';
import { AccessServiceType } from './types';

export const registerOriginAccessProvider = () => {
  tryRegisterProvider(AccessServiceType, getAccessHandler());
};
