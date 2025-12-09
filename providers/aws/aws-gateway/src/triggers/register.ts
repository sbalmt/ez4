import type { ConnectResourceEvent, PolicyResourceEvent, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsFunctionTriggers } from '@ez4/aws-function';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerGatewayTriggers } from '@ez4/gateway/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerGatewayProvider } from '../gateway/provider';
import { registerAuthorizerProvider } from '../authorizer/provider';
import { registerIntegrationProvider } from '../integration/provider';
import { registerResponseProvider } from '../response/provider';
import { registerRouteProvider } from '../route/provider';
import { registerStageProvider } from '../stage/provider';

import { prepareHttpImports, prepareHttpLinkedImport } from './http/import';
import { connectHttpServices, prepareHttpLinkedService, prepareHttpServices } from './http/service';
import { connectWsServices, prepareWsLinkedService, prepareWsServices } from './ws/service';
import { prepareWsExecutionPolicy } from './ws/policy';
import { resourceOutput } from './output';

export const registerTriggers = () => {
  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerAwsFunctionTriggers();
  registerGatewayTriggers();

  tryCreateTrigger('@ez4/aws-gateway', {
    'deploy:prepareExecutionPolicy': prepareExecutionPolicy,
    'deploy:prepareLinkedService': prepareLinkedService,
    'deploy:prepareResources': prepareServices,
    'deploy:connectResources': connectServices,
    'deploy:resourceOutput': resourceOutput
  });

  registerGatewayProvider();
  registerAuthorizerProvider();
  registerIntegrationProvider();
  registerResponseProvider();
  registerStageProvider();
  registerRouteProvider();
};

const prepareExecutionPolicy = (event: PolicyResourceEvent) => {
  return prepareWsExecutionPolicy(event);
};

const prepareLinkedService = (event: ServiceEvent) => {
  return prepareHttpLinkedService(event) ?? prepareWsLinkedService(event) ?? prepareHttpLinkedImport(event);
};

const prepareServices = (event: PrepareResourceEvent) => {
  return prepareHttpServices(event) || prepareWsServices(event) || prepareHttpImports(event);
};

const connectServices = (event: ConnectResourceEvent) => {
  connectHttpServices(event);
  connectWsServices(event);
};
