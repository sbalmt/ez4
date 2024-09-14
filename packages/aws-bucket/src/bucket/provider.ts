import { registerProvider } from '@ez4/aws-common';

import { getBucketHandler } from './handler.js';
import { BucketServiceType } from './types.js';

export const registerBucketProvider = () => {
  registerProvider(BucketServiceType, getBucketHandler());
};
