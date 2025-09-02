import { registerProvider } from '@ez4/aws-common';

import { getBucketHandler } from './handler';
import { BucketServiceType } from './types';

export const registerBucketProvider = () => {
  registerProvider(BucketServiceType, getBucketHandler());
};
