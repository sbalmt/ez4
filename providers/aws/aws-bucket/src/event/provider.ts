import { tryRegisterProvider } from '@ez4/aws-common';

import { getBucketEventHandler } from './handler';
import { BucketEventServiceType } from './types';

export const registerBucketEventProvider = () => {
  tryRegisterProvider(BucketEventServiceType, getBucketEventHandler());
};
