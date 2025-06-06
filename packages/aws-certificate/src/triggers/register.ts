import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';

import { registerCertificateProvider } from '../certificate/provider.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerAwsTriggers();

  registerCertificateProvider();

  isRegistered = true;
};
