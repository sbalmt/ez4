import { hashData, toKebabCase } from '@ez4/utils';
import { getRegion } from '@ez4/aws-identity';

import { BucketServiceType } from './types.js';

export const getBucketId = (bucketName: string) => {
  return hashData(BucketServiceType, toKebabCase(bucketName));
};

export const getBucketDomain = async (bucketName: string) => {
  const region = await getRegion();

  return `${bucketName}.s3.${region}.amazonaws.com`;
};
