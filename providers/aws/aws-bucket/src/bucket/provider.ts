import { tryRegisterProvider } from '@ez4/aws-common';

import { getBucketHandler } from './handler';
import { BucketServiceType } from './types';

export const registerBucketProvider = () => {
  tryRegisterProvider(BucketServiceType, getBucketHandler());
};
