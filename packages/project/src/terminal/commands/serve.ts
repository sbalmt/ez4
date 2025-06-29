import type { IncomingMessage, ServerResponse } from 'node:http';
import type { EmulatorHandlerResponse } from '../../types/emulator.js';
import type { EmulatorServices } from '../../library/emulator.js';
import type { ProjectOptions } from '../../types/project.js';
import type { ServeOptions } from '../../types/options.js';

import { toKebabCase } from '@ez4/utils';

import { createServer } from 'node:http';

import { loadProviders } from '../../services/providers.js';
import { getMetadata } from '../../library/metadata.js';
import { getEmulators } from '../../library/emulator.js';
import { Logger } from '../../utils/logger.js';

export const serveCommand = async (project: ProjectOptions) => {
  const serviceHost = project.serve?.host ?? 'localhost';
  const servicePort = project.serve?.port ?? 3734;

  const options: ServeOptions = {
    resourcePrefix: project.prefix ?? 'ez4',
    projectName: toKebabCase(project.projectName),
    host: `${serviceHost}:${servicePort}`
  };

  await Logger.execute('Loading providers', () => {
    return loadProviders(project);
  });

  const { metadata } = await Logger.execute('Loading metadata', () => {
    return getMetadata(project.sourceFiles);
  });

  const { emulators } = await getEmulators(metadata, options);

  const server = createServer((request, stream) => {
    const service = getRequestService(emulators, request, options);

    if (!service?.emulator) {
      sendErrorResponse(stream, 422, 'Service emulator not found.');
      return;
    }

    const { name: serviceName, requestHandler } = service.emulator;

    if (!requestHandler) {
      sendErrorResponse(stream, 422, `Service ${serviceName} can't handle requests.`);
      return;
    }

    const buffer: Buffer[] = [];

    request.on('data', (chunk) => {
      buffer.push(chunk);
    });

    request.on('end', async () => {
      try {
        const payload = buffer.length ? Buffer.concat(buffer) : undefined;

        const response = await requestHandler({
          ...service.request,
          method: request.method ?? 'GET',
          body: payload
        });

        if (response) {
          sendPlainResponse(stream, response);
        }
      } catch (error) {
        sendErrorResponse(stream, 500, `${error}`);
      } finally {
        stream.end();
      }
    });
  });

  server.on('error', () => {
    Logger.error(`Unable to serve project ${project.projectName} at http://${options.host}`);
  });

  server.listen(servicePort, serviceHost, () => {
    for (const identifier in emulators) {
      const { type, name } = emulators[identifier];

      Logger.log(`Serving ${type} [${name}] at http://${options.host}/${identifier}`);
    }

    Logger.log(`Project ${project.projectName} up and running!`);
  });
};

const getRequestService = (emulator: EmulatorServices, request: IncomingMessage, options: ServeOptions) => {
  if (!request.url) {
    return undefined;
  }

  const { pathname, searchParams } = new URL(request.url, `http://${options.host}`);
  const [, identifier, ...path] = pathname.split('/');

  return {
    identifier,
    emulator: emulator[identifier],
    request: {
      path: `/${path.join('/')}`,
      headers: getDistinctHeaders(request.headersDistinct),
      query: searchParams
    }
  };
};

const getDistinctHeaders = (allHeaders: Record<string, string[] | undefined>) => {
  const distinctHeaders: Record<string, string> = {};

  for (const name in allHeaders) {
    const value = allHeaders[name];

    if (Array.isArray(value)) {
      distinctHeaders[name] = value[0];
    }
  }

  return distinctHeaders;
};

const sendPlainResponse = (stream: ServerResponse<IncomingMessage>, response: EmulatorHandlerResponse) => {
  stream.writeHead(response.status, response.headers);

  if (response.body) {
    stream.write(response.body);
  }

  stream.end();
};

const sendErrorResponse = (stream: ServerResponse<IncomingMessage>, status: number, message: string) => {
  sendPlainResponse(stream, {
    status,
    headers: {
      ['content-type']: 'application/json'
    },
    body: JSON.stringify({
      status: 'error',
      message
    })
  });
};
