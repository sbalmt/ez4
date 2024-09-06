import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsFunctionTriggers } from '@ez4/aws-function';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerGatewayTriggers } from '@ez4/gateway/library';

import { createTrigger } from '@ez4/project/library';

import { prepareHttpServices } from './http.js';

let isRegistered = false;

/**
 * Register all triggers.
 */
export const registerTriggers = () => {
  if (!isRegistered) {
    registerAwsTriggers();
    registerAwsIdentityTriggers();
    registerAwsFunctionTriggers();
    registerGatewayTriggers();

    createTrigger('@ez4/aws-gateway', {
      'deploy:prepareResources': prepareHttpServices
    });

    isRegistered = true;
  }

  return isRegistered;
};
