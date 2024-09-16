import type { EntryState, StepContext } from '@ez4/stateful';

import { ObjectServiceType, ObjectState } from './types.js';

export const getObjectPath = (bucketName: string, objectKey: string) => {
  return `${bucketName}/${objectKey}`;
};

export const getObjectFiles = <E extends EntryState>(context: StepContext<E | ObjectState>) => {
  const resources = context.getDependencies(ObjectServiceType);

  return resources.map(({ result }) => {
    return {
      lastModified: result?.lastModified,
      objectKey: result?.objectKey
    };
  });
};
