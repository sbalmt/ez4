const { DOCS_UI_ENABLED = 'false' } = process.env;

import {
  type EmulatorServiceRequest,
  type EmulatorHandlerResponse,
  type ServiceMetadata,
  type ServeOptions,
  getServiceName
} from '@ez4/project/library';
import { isHttpService } from '@ez4/gateway/library';
import { scalarTemplate } from './templates';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import YAML from 'yaml';

type Oas = Record<string, unknown> & {
  servers?: Record<string, unknown>[];
};

export const handleFallbackRequest = (event: {
  request: EmulatorServiceRequest;
  service: ServiceMetadata;
  options: ServeOptions;
}): EmulatorHandlerResponse | null => {
  const { request, service, options } = event;

  if (DOCS_UI_ENABLED === 'false') {
    return null;
  }

  if (!isHttpService(service)) {
    return null;
  }

  if (request.path !== '/docs' || request.method !== 'GET') {
    return null;
  }

  const html = generateHtml(service.name, options);

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

const generateHtml = (serviceName: string, options: ServeOptions): string | null => {
  const template = scalarTemplate;
  const title = `${serviceName} API`;
  const spec = getOasContent();

  if (!spec) {
    return null;
  }

  const prefix = getServiceName(serviceName, options);

  spec.servers = [{ url: `http://${options.serviceHost}/${prefix}` }];

  return template.replace('__TITLE__', title).replace('__SPEC__', JSON.stringify(spec));
};

const getOasContent = (): Oas | null => {
  try {
    return YAML.parse(readFileSync(resolve(process.cwd(), 'docs/api-oas.yml'), 'utf-8'));
  } catch (e) {
    return null;
  }
};
