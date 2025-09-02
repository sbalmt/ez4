import { registerProvider } from '@ez4/aws-common';

import { getAccessHandler } from './handler';
import { AccessServiceType } from './types';

export const registerOriginAccessProvider = () => {
  registerProvider(AccessServiceType, getAccessHandler());
};
