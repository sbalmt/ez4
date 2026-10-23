import type { ServeOptions, ServiceEmulator } from '@ez4/project/library';
import type { HttpService } from '@ez4/gateway/library';

import { OpenApiGenerator } from '@ez4/docs-gateway/library';
import { getServiceName } from '@ez4/project/library';
import { getSuccessResponse, ProviderType, registerProvider, unregisterProvider } from '@ez4/server';

import { parse as parseYaml } from 'yaml';

import { scalarTemplate } from './templates';

type Oas = Record<string, unknown> & {
  servers?: Record<string, unknown>[];
};

export const registerDocsProvider = (gateway: HttpService, options: ServeOptions): ServiceEmulator => {
  const identifier = `${getServiceName(gateway.name, options)}/docs`;

  return {
    type: 'Documentation',
    name: gateway.name,
    identifier,
    bootstrapHandler: () => {
      registerProvider(identifier, {
        type: ProviderType.Http,
        requestHandler: ({ method, path }) => {
          if (method !== 'GET' || path !== '/') {
            return getSuccessResponse(404);
          }

          return {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
            body: generateHtml(gateway, options)
          };
        }
      });
    },
    shutdownHandler: () => {
      unregisterProvider(identifier);
    }
  };
};

const generateHtml = (service: HttpService, options: ServeOptions): string => {
  const spec = getOasContent(service);

  const template = scalarTemplate;
  const prefix = getServiceName(service.name, options);

  spec.servers = [{ url: `http://${options.serviceHost}/${prefix}` }];

  const title = `${service.name} API`;

  return template.replace('__TITLE__', title).replace('__SPEC__', JSON.stringify(spec));
};

const getOasContent = (service: HttpService): Oas => {
  const spec: unknown = parseYaml(OpenApiGenerator.getGatewayOutput(service));

  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
    throw new Error(`Invalid OpenAPI document for gateway [${service.name}].`);
  }

  return { ...spec };
};
