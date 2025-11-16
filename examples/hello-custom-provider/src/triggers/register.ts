import { createTrigger } from '@ez4/project/library';

import { getMetadataServices } from './metadata';

let isRegistered = false;

/**
 * The entrypoint of the package must export this function.
 */
export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  // There are several trigger you can create to react and modify internal actions.
  createTrigger('hello-custom-provider', {
    'metadata:getServices': getMetadataServices
  });

  isRegistered = true;
};
