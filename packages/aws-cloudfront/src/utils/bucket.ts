import { getRegion } from '@ez4/aws-identity';

export const getBucketUrl = async (bucketName: string) => {
  const region = await getRegion();

  return `${bucketName}.s3.${region}.amazonaws.com`;
};
