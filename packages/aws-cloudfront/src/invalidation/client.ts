import { Logger } from '@ez4/aws-common';

import { CloudFrontClient, CreateInvalidationCommand, waitUntilInvalidationCompleted } from '@aws-sdk/client-cloudfront';

import { InvalidationServiceName } from './types.js';

const client = new CloudFrontClient({});

const waiter = {
  minDelay: 15,
  maxWaitTime: 1800,
  maxDelay: 60,
  client
};

export const createInvalidation = async (distributionId: string, paths: string[]) => {
  Logger.logCreate(InvalidationServiceName, `${distributionId} invalidation`);

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

  Logger.logWait(InvalidationServiceName, distributionId);

  await waitUntilInvalidationCompleted(waiter, {
    DistributionId: distributionId,
    Id: response.Invalidation?.Id!
  });
};
