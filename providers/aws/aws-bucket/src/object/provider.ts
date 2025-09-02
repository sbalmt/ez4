import { registerProvider } from '@ez4/aws-common';

import { getObjectHandler } from './handler';
import { ObjectServiceType } from './types';

export const registerObjectProvider = () => {
  registerProvider(ObjectServiceType, getObjectHandler());
};
