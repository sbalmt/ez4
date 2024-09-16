import type { EntryState, StepContext } from '@ez4/stateful';

import { ObjectServiceType, ObjectState } from './types.js';

export const isBucketObjectState = (resource: EntryState): resource is ObjectState => {
  return resource.type === ObjectServiceType;
};

export const getBucketObjectPath = (bucketName: string, objectKey: string) => {
  return `${bucketName}/${objectKey}`;
};

export const getBucketObjectFiles = <E extends EntryState>(
  context: StepContext<E | ObjectState>
) => {
  const resources = context.getDependencies(ObjectServiceType);

  return resources.map(({ result }) => {
    return {
      lastModified: result?.lastModified,
      objectKey: result?.objectKey
    };
  });
};
