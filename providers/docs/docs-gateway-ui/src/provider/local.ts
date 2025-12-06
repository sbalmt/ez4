import {
  type EmulatorServiceRequest,
  type EmulatorHandlerResponse,
  type ServiceMetadata,
  type ServeOptions,
  getServiceName
} from '@ez4/project/library';
import { HttpService, isHttpService } from '@ez4/gateway/library';
import { scalarTemplate } from './templates';
import { OpenApiGenerator } from '@ez4/docs-gateway/library';
import { parse as parseYaml } from 'yaml';

type Oas = Record<string, unknown> & {
  servers?: Record<string, unknown>[];
};

export const handleFallbackRequest = (event: {
  request: EmulatorServiceRequest;
  service: ServiceMetadata;
  options: ServeOptions;
}): EmulatorHandlerResponse | null => {
  const { service } = event;

  if (!isHttpService(service)) {
    return null;
  }

  const {
    request: { path, method },
    options
  } = event;

  if (path !== '/docs' || method !== 'GET') {
    return null;
  }

  const html = generateHtml(service, options);

  if (!html) {
    return null;
  }

  return {
    status: 200,
    headers: {
      'Content-Type': 'text/html'
    },
    body: html
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
  } catch (e) {
    return null;
  }
};
