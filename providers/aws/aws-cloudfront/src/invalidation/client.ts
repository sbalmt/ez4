import type { Logger } from '@ez4/aws-common';

import { CloudFrontClient, CreateInvalidationCommand, waitUntilInvalidationCompleted } from '@aws-sdk/client-cloudfront';

const client = new CloudFrontClient({});

const waiter = {
  minDelay: 15,
  maxWaitTime: 1800,
  maxDelay: 60,
  client
};

export const createInvalidation = async (logger: Logger.OperationLogger, distributionId: string, paths: string[]) => {
  logger.update(`Invalidating distribution cache`);

  const response = await client.send(
    new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: `EZ4:${Date.now()}`,
        Paths: {
          Quantity: paths.length,
          Items: paths
        }
      }
    })
  );

  await waitUntilInvalidationCompleted(waiter, {
    DistributionId: distributionId,
    Id: response.Invalidation?.Id!
  });
};
