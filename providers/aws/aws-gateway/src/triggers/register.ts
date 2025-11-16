import type { ConnectResourceEvent, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsFunctionTriggers } from '@ez4/aws-function';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerGatewayTriggers } from '@ez4/gateway/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerGatewayProvider } from '../gateway/provider';
import { registerAuthorizerProvider } from '../authorizer/provider';
import { registerIntegrationProvider } from '../integration/provider';
import { registerRouteProvider } from '../route/provider';
import { registerStageProvider } from '../stage/provider';

import { connectServices, prepareLinkedServices, prepareServices } from './service';
import { prepareImports, prepareLinkedImports } from './import';

export const registerTriggers = () => {
  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerAwsFunctionTriggers();
  registerGatewayTriggers();

  tryCreateTrigger('@ez4/aws-gateway', {
    'deploy:prepareLinkedService': prepareLinkedService,
    'deploy:prepareResources': prepareHttpServices,
    'deploy:connectResources': connectHttpServices
  });

  registerGatewayProvider();
  registerAuthorizerProvider();
  registerIntegrationProvider();
  registerStageProvider();
  registerRouteProvider();
};

const prepareLinkedService = (event: ServiceEvent) => {
  return prepareLinkedServices(event) ?? prepareLinkedImports(event) ?? null;
};

const prepareHttpServices = (event: PrepareResourceEvent) => {
  return prepareServices(event) || prepareImports(event);
};

const connectHttpServices = (event: ConnectResourceEvent) => {
  connectServices(event);
};
