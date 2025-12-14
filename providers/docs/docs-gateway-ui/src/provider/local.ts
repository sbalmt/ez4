import type { ServeOptions, EmulatorFallbackRequestEvent } from '@ez4/project/library';
import type { HttpService } from '@ez4/gateway/library';

import { OpenApiGenerator } from '@ez4/docs-gateway/library';
import { getServiceName } from '@ez4/project/library';
import { isHttpService } from '@ez4/gateway/library';

import { parse as parseYaml } from 'yaml';

import { scalarTemplate } from './templates';

type Oas = Record<string, unknown> & {
  servers?: Record<string, unknown>[];
};

export const handleFallbackRequest = (event: EmulatorFallbackRequestEvent) => {
  const { request, service, options } = event;

  if (!isHttpService(service)) {
    return null;
  }

  const { method, path } = request;

  if (path !== '/docs' || method !== 'GET') {
    return null;
  }

  const body = generateHtml(service, options);

  if (!body) {
    return null;
  }

  return {
    status: 200,
    headers: {
      'Content-Type': 'text/html'
    },
    body
  };
};

const generateHtml = (service: HttpService, options: ServeOptions): string | null => {
  const spec = getOasContent(service);

  if (!spec) {
    return null;
  }

  const template = scalarTemplate;
  const prefix = getServiceName(service.name, options);

  spec.servers = [{ url: `http://${options.serviceHost}/${prefix}` }];

  const title = `${service.name} API`;

  return template.replace('__TITLE__', title).replace('__SPEC__', JSON.stringify(spec));
};

const getOasContent = (service: HttpService): Oas | null => {
  try {
    return parseYaml(OpenApiGenerator.getGatewayOutput(service)) as Oas;
  } catch {
    return null;
  }
};
