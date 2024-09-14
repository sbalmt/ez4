import { registerProvider } from '@ez4/aws-common';

import { getObjectHandler } from './handler.js';
import { ObjectServiceType } from './types.js';

export const registerObjectProvider = () => {
  registerProvider(ObjectServiceType, getObjectHandler());
};
