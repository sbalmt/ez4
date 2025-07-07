import { getRegion } from '@ez4/aws-identity';

export const isBucketDomain = (domain: string) => {
  return /(.+)\.s3\.(.+)\.amazonaws\.com/i.test(domain);
};

export const getBucketDomain = async (bucketName: string) => {
  const region = await getRegion();

  return `${bucketName}.s3.${region}.amazonaws.com`;
};
