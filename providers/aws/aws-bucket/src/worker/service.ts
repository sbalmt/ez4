import { Client } from '../client';

export type ServiceOptions = {
  bucketName: string;
};

export const makeService = ({ bucketName }: ServiceOptions) => {
  return () => Client.make(bucketName);
};
