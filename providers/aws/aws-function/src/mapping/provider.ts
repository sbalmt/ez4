import { tryRegisterProvider } from '@ez4/aws-common';

import { getMappingHandler } from './handler';
import { MappingServiceType } from './types';

export const registerMappingProvider = () => {
  tryRegisterProvider(MappingServiceType, getMappingHandler());
};
