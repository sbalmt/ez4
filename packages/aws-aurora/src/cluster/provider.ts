import { registerProvider } from '@ez4/aws-common';

import { getClusterHandler } from './handler.js';
import { ClusterServiceType } from './types.js';

export const registerClusterProvider = () => {
  registerProvider(ClusterServiceType, getClusterHandler());
};
