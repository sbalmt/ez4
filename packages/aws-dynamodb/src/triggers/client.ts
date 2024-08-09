import type { ExtraSource, ServiceEvent } from '@ez4/project';

import { isDatabaseService } from '@ez4/database/library';

export const prepareLinkedService = async (event: ServiceEvent): Promise<ExtraSource | null> => {
  const { service } = event;

  if (!isDatabaseService(service)) {
    return null;
  }

  return {
    constructor: `make()`,
    module: 'Client',
    from: '@ez4/aws-dynamodb/client'
  };
};
