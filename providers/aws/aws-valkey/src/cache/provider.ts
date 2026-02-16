import { tryRegisterProvider } from '@ez4/aws-common';

import { getCacheHandler } from './handler';
import { CacheServiceType } from './types';

export const registerCacheProvider = () => {
  tryRegisterProvider(CacheServiceType, getCacheHandler());
};
