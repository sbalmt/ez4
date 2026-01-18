import type { Logger } from '@ez4/aws-common';

import { CreateInvalidationCommand, waitUntilInvalidationCompleted } from '@aws-sdk/client-cloudfront';

import { getCloudFrontClient, getCloudFrontWaiter } from '../utils/deploy';

export const createInvalidation = async (logger: Logger.OperationLogger, distributionId: string, paths: string[]) => {
  logger.update(`Invalidating distribution cache`);

  const client = getCloudFrontClient();

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

  await waitUntilInvalidationCompleted(getCloudFrontWaiter(client), {
    DistributionId: distributionId,
    Id: response.Invalidation?.Id!
  });
};
