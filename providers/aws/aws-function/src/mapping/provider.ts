import { registerProvider } from '@ez4/aws-common';

import { getMappingHandler } from './handler';
import { MappingServiceType } from './types';

export const registerMappingProvider = () => {
  registerProvider(MappingServiceType, getMappingHandler());
};
