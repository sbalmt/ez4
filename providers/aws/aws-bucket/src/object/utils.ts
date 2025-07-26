import type { EntryState, StepContext } from '@ez4/stateful';
import type { ObjectState } from './types.js';

import { ObjectServiceType } from './types.js';

export const isBucketObjectState = (resource: EntryState): resource is ObjectState => {
  return resource.type === ObjectServiceType;
};

export const getBucketObjectPath = (bucketName: string, objectKey: string) => {
  return `${bucketName}/${objectKey}`;
};

export const getBucketObjectFiles = (context: StepContext) => {
  const resources = context.getDependencies<ObjectState>(ObjectServiceType);

  return resources.map(({ result, parameters }) => {
    return {
      lastModified: result?.lastModified,
      objectKey: parameters.objectKey
    };
  });
};
