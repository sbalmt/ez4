import { getAwsClientOptions, getAwsClientWaiter } from '@ez4/aws-common';
import { ElastiCacheClient } from '@aws-sdk/client-elasticache';

export const getCacheClient = () => {
  return new ElastiCacheClient(getAwsClientOptions());
};

export const getCacheWaiter = (client: ElastiCacheClient) => {
  return {
    ...getAwsClientWaiter(),
    client
  };
};
