import { Client } from '@ez4/aws-bucket/client';

export type ServiceOptions = {
  bucketName: string;
};

export const makeService = ({ bucketName }: ServiceOptions) => {
  return () => Client.make(bucketName);
};
