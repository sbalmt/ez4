import type { EmulatorServiceRequest, EmulatorHandlerResponse, ServiceMetadata } from '@ez4/project/library';
import type { HttpService } from '@ez4/gateway/library';
import type { DocsConfig } from '../types/config';

import { isHttpService } from '@ez4/gateway/library';
import { getDocsConfig } from './utils';
import { scalarTemplate, swaggerTemplate } from './templates';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const handleFallbackRequest = async (event: {
  request: EmulatorServiceRequest;
  service: ServiceMetadata;
}): Promise<EmulatorHandlerResponse | null> => {
  const { request, service } = event;

  console.log(service);

  if (!isHttpService(service)) {
    return null;
  }

  const config = getDocsConfig(service as HttpService);

  console.log(config);

  if (!config) {
    return null;
  }

  const docsPath = config.path || '/docs';

  if (request.path !== docsPath || request.method !== 'GET') {
    return null;
  }

  const oasContent = await getOasContent(service as HttpService, config);
  const html = generateHtml(service.name, oasContent, config);

  return {
    status: 200,
    headers: {
      'Content-Type': 'text/html'
    },
    body: html
  };
};

const generateHtml = (serviceName: string, oasContent: string, config: DocsConfig) => {
  const ui = config.ui || 'scalar';
  const template = ui === 'swagger' ? swaggerTemplate : scalarTemplate;

  const title = config.title || `${serviceName} API`;

  return (
    template
      .replace('__TITLE__', title)
      // Escape OAS content for embedding in JS string/JSON
      .replace('__SPEC__', JSON.stringify(oasContent))
  );
};

const getOasContent = async (service: HttpService, config: DocsConfig) => {
  if (config.oas) {
    const content = await readFile(config.oas, 'utf-8').catch(() => null);

    if (content) {
      return content;
    }
  }

  try {
    const content = await readFile(resolve(process.cwd(), 'docs/api-oas.yml'), 'utf-8');
    return content;
  } catch (e) {
    // ignore
  }

  return `openapi: 3.0.0
info:
  title: ${service.name}
  version: 0.0.0
paths: {}`;
};
