import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsFunctionTriggers } from '@ez4/aws-function';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerGatewayTriggers } from '@ez4/gateway/library';

import { createTrigger } from '@ez4/project/library';

import { registerGatewayProvider } from '../gateway/provider';
import { registerAuthorizerProvider } from '../authorizer/provider';
import { registerIntegrationProvider } from '../integration/provider';
import { registerRouteProvider } from '../route/provider';
import { registerStageProvider } from '../stage/provider';

import { connectHttpServices, prepareHttpServices } from './service';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerAwsFunctionTriggers();
  registerGatewayTriggers();

  createTrigger('@ez4/aws-gateway', {
    'deploy:prepareResources': prepareHttpServices,
    'deploy:connectResources': connectHttpServices
  });

  registerGatewayProvider();
  registerAuthorizerProvider();
  registerIntegrationProvider();
  registerStageProvider();
  registerRouteProvider();

  isRegistered = true;
};
