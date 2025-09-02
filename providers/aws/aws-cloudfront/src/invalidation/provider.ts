import { registerProvider } from '@ez4/aws-common';

import { getInvalidationHandler } from './handler';
import { InvalidationServiceType } from './types';

export const registerInvalidationProvider = () => {
  registerProvider(InvalidationServiceType, getInvalidationHandler());
};
