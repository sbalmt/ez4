import { registerProvider } from '@ez4/aws-common';

import { getInvalidationHandler } from './handler.js';
import { InvalidationServiceType } from './types.js';

export const registerInvalidationProvider = () => {
  registerProvider(InvalidationServiceType, getInvalidationHandler());
};
