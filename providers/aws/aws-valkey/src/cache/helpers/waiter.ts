import type { ElastiCacheClient } from '@aws-sdk/client-elasticache';

import { DescribeServerlessCachesCommand, ServerlessCacheNotFoundFault } from '@aws-sdk/client-elasticache';
import { Wait } from '@ez4/utils';

export const waitForServerlessCache = async (client: ElastiCacheClient, cacheName: string) => {
  const readyStatus = new Set(['available', 'create-failed']);

  await Wait.until(async () => {
    const status = await getCacheStatus(client, cacheName);

    if (status && !readyStatus.has(status)) {
      return Wait.RetryAttempt;
    }

    return true;
  });
};

const getCacheStatus = async (client: ElastiCacheClient, cacheName: string) => {
  try {
    const response = await client.send(
      new DescribeServerlessCachesCommand({
        ServerlessCacheName: cacheName
      })
    );

    return response.ServerlessCaches?.[0].Status;
  } catch (error) {
    if (error instanceof ServerlessCacheNotFoundFault) {
      return undefined;
    }

    throw error;
  }
};
