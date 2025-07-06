import { registerProvider } from '@ez4/aws-common';

import { getMappingHandler } from './handler.js';
import { MappingServiceType } from './types.js';

export const registerMappingProvider = () => {
  registerProvider(MappingServiceType, getMappingHandler());
};
