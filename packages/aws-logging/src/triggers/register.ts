import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';

import { registerGroupProvider } from '../group/provider.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerAwsTriggers();
  registerGroupProvider();

  isRegistered = true;
};
