import { tryRegisterProvider } from '@ez4/aws-common';

import { getClusterHandler } from './handler';
import { ClusterServiceType } from './types';

export const registerClusterProvider = () => {
  tryRegisterProvider(ClusterServiceType, getClusterHandler());
};
