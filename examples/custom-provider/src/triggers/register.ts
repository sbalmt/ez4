import { tryCreateTrigger } from '@ez4/project/library';

import { getMetadataServices } from './metadata';

/**
 * The entrypoint of the package must export this function.
 */
export const registerTriggers = () => {
  // There are several trigger you can create to react and modify internal actions.
  tryCreateTrigger('hello-custom-provider', {
    'metadata:getServices': getMetadataServices
  });
};
