import type { DeployOptions, EventContext, ContextSource, EmulateDescriptorEvent } from '@ez4/project/library';
import type { BucketService } from '@ez4/storage/library';

import { isBucketService } from '@ez4/storage/library';

import { getBucketState } from '../bucket/utils';
import { getBucketName } from './utils';

export const prepareLinkedClient = (context: EventContext, service: BucketService, options: DeployOptions): ContextSource => {
  const bucketState = getBucketState(context, service.name, options);
  const bucketId = bucketState.entryId;

  return {
    module: 'Client',
    from: '@ez4/aws-bucket/client',
    constructor: `@{EZ4_MODULE_IMPORT}.make('${bucketState.parameters.bucketName}')`,
    dependencyIds: [bucketId],
    connectionIds: [bucketId]
  };
};

export const prepareEmulatorDescriptor = async (event: EmulateDescriptorEvent) => {
  const { service, options } = event;

  if (!isBucketService(service) || options.local) {
    return null;
  }

  const bucketName = await getBucketName(service, options);
  return {
    name: 'makeService',
    module: '@ez4/aws-bucket/worker',
    options: {
      bucketName
    }
  };
};
