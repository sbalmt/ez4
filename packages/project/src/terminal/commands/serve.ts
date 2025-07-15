import type { IncomingMessage, ServerResponse } from 'node:http';
import type { EmulatorHandlerResponse } from '../../types/emulator.js';
import type { EmulatorServices } from '../../library/emulator.js';
import type { ProjectOptions } from '../../types/project.js';
import type { ServeOptions } from '../../types/options.js';

import { toKebabCase } from '@ez4/utils';

import { createServer } from 'node:http';

import { loadProviders } from '../../common/providers.js';
import { getMetadata } from '../../library/metadata.js';
import { getEmulators } from '../../library/emulator.js';
import { Logger } from '../../utils/logger.js';

export const serveCommand = async (project: ProjectOptions) => {
  const serveOptions = project.serveOptions;

  const serviceHost = serveOptions?.localHost ?? 'localhost';
  const servicePort = serveOptions?.localPort ?? 3734;

  const options: ServeOptions = {
    resourcePrefix: project.prefix ?? 'ez4',
    projectName: toKebabCase(project.projectName),
    providerOptions: serveOptions?.providerOptions ?? {},
    serviceHost: `${serviceHost}:${servicePort}`,
    variables: project.variables,
    debug: project.debugMode
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
      sendErrorResponse(stream, 404, 'Service emulator not found.');
      return;
    }

    const { requestHandler, ...emulator } = service.emulator;

    if (!requestHandler) {
      sendErrorResponse(stream, 422, `Service ${emulator.name} can't handle requests.`);
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
        Logger.error(`${emulator.type} [${emulator.name}] ${error}`);

        if (error instanceof Error) {
          sendErrorResponse(stream, 500, error.message);
        } else {
          sendErrorResponse(stream, 500, `${error}`);
        }
      } finally {
        stream.end();
      }
    });
  });

  server.on('error', () => {
    Logger.error(`❌ Unable to serve project ${project.projectName} at http://${options.serviceHost}`);
  });

  server.listen(servicePort, serviceHost, async () => {
    await bootstrapServices(emulators, options);

    Logger.log(`🚀 Project ${project.projectName} up and running!`);
  });
};

const getRequestService = (emulator: EmulatorServices, request: IncomingMessage, options: ServeOptions) => {
  if (!request.url) {
    return undefined;
  }

  const { pathname, searchParams } = new URL(request.url, `http://${options.serviceHost}`);
  const [, identifier, ...path] = pathname.split('/');

  return {
    identifier,
    emulator: emulator[identifier],
    request: {
      path: `/${path.join('/')}`,
      headers: getDistinctHeaders(request.headersDistinct),
      query: Object.fromEntries(searchParams.entries())
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

const bootstrapServices = async (emulators: EmulatorServices, options: ServeOptions) => {
  for (const identifier in emulators) {
    const emulator = emulators[identifier];

    if (emulator.bootstrapHandler) {
      await emulator.bootstrapHandler();
    }

    if (emulator.requestHandler) {
      Logger.log(`🌐 Serving ${emulator.type} [${emulator.name}] at http://${options.serviceHost}/${identifier}`);
    }
  }
};
