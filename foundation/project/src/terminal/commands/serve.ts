import type { IncomingMessage, ServerResponse } from 'node:http';
import type { EmulatorHandlerResponse } from '../../types/emulator';
import type { EmulatorServices } from '../../library/emulator';
import type { ProjectOptions } from '../../types/project';
import type { ServeOptions } from '../../types/options';

import { Logger, LogLevel } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

import { createServer } from 'node:http';

import { getServiceAddress, getServiceHost, getServicePort } from '../../utils/project';
import { getEmulators } from '../../library/emulator';
import { watchMetadata } from '../../library/metadata';
import { loadProviders } from '../../common/providers';
import { loadImports } from '../../common/imports';

export const serveCommand = async (project: ProjectOptions) => {
  const options: ServeOptions = {
    resourcePrefix: project.prefix ?? 'ez4',
    projectName: toKebabCase(project.projectName),
    serviceHost: getServiceHost(project.serveOptions),
    localOptions: project.localOptions ?? {},
    variables: project.variables,
    force: project.forceMode,
    debug: project.debugMode,
    local: project.localMode,
    version: 0
  };

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  await Logger.execute('🔄️ Loading providers', () => {
    return loadProviders(project);
  });

  options.imports = await Logger.execute('🔄️ Loading imports', () => {
    return loadImports(project);
  });

  let emulators: EmulatorServices = {};

  const watcher = await watchMetadata(project.sourceFiles, async (metadata) => {
    if (options.version > 0) {
      await shutdownServices(emulators);
      Logger.space();
    }

    emulators = await Logger.execute('🔄️ Loading emulators', () => {
      return getEmulators(metadata, options);
    });

    displayServices(emulators, options);

    await bootstrapServices(emulators);

    if (options.version > 0) {
      Logger.log(`🚀 Project [${project.projectName}] reloaded`);
    }

    options.version++;
  });

  const server = createServer((request, stream) => {
    const service = getRequestService(emulators, request, options);

    Logger.log(`➡️  ${request.method} ${request.url}`);

    if (!service?.emulator) {
      return sendErrorResponse(stream, request, 404, 'Service emulator not found.');
    }

    if (request.method === 'OPTIONS') {
      return sendPlainResponse(stream, request, { status: 204 });
    }

    const { requestHandler, ...emulator } = service.emulator;

    if (!requestHandler) {
      return sendErrorResponse(stream, request, 422, `Service ${emulator.name} can't handle requests.`);
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

        if (!response) {
          sendPlainResponse(stream, request, { status: 204 });
        } else {
          sendPlainResponse(stream, request, response);
        }
      } catch (error) {
        Logger.error(`${emulator.type} [${emulator.name}] ${error}`);

        if (error instanceof Error) {
          sendErrorResponse(stream, request, 500, error.message);
        } else {
          sendErrorResponse(stream, request, 500, `${error}`);
        }
      }
    });
  });

  server.on('error', async () => {
    Logger.error(`Unable to serve project [${project.projectName}] at http://${options.serviceHost}`);
    await shutdownServices(emulators);
    watcher.stop();
  });

  const bindHost = getServiceAddress(project.serveOptions);
  const bindPort = getServicePort(project.serveOptions);

  server.listen(bindPort, bindHost, () => {
    Logger.log(`🚀 Project [${project.projectName}] up and running`);
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

const sendPlainResponse = (stream: ServerResponse<IncomingMessage>, request: IncomingMessage, response: EmulatorHandlerResponse) => {
  const responseStatus = response.status;

  Logger.log(`⬅️  ${responseStatus} ${request.url ?? '/'}`);

  if (request.headers.origin) {
    setCorsResponseHeaders(stream, request);
  }

  stream.writeHead(responseStatus, {
    ...response.headers,
    ...(response.body && {
      ['Content-Length']: Buffer.byteLength(response.body)
    })
  });

  if (response.body) {
    stream.write(response.body);
  }

  stream.end();
};

const sendErrorResponse = (stream: ServerResponse<IncomingMessage>, request: IncomingMessage, status: number, message: string) => {
  sendPlainResponse(stream, request, {
    status,
    headers: {
      ['Content-Type']: 'application/json'
    },
    body: JSON.stringify({
      status: 'error',
      message
    })
  });
};

const setCorsResponseHeaders = (stream: ServerResponse<IncomingMessage>, request: IncomingMessage) => {
  const responseOrigin = request.headers.origin;

  if (responseOrigin) {
    stream.setHeader('Access-Control-Allow-Origin', responseOrigin);
    stream.setHeader('Access-Control-Allow-Credentials', 'true');

    if (request.method !== 'OPTIONS') {
      return;
    }

    const responseMethod = request.headers['access-control-request-method'] ?? request.method;
    const responseHeaders = request.headers['access-control-request-headers'];

    if (responseHeaders) {
      stream.setHeader('Access-Control-Allow-Headers', responseHeaders);
    }

    stream.setHeader('Access-Control-Allow-Methods', responseMethod);
  }
};

const bootstrapServices = async (emulators: EmulatorServices) => {
  process.env.EZ4_IS_LOCAL = 'true';

  for (const identifier in emulators) {
    const emulator = emulators[identifier];

    if (emulator.bootstrapHandler) {
      await emulator.bootstrapHandler();
    }
  }
};

const displayServices = (emulators: EmulatorServices, options: ServeOptions) => {
  for (const identifier in emulators) {
    const emulator = emulators[identifier];

    if (emulator.requestHandler) {
      Logger.log(`🌐 Serving ${emulator.type} [${emulator.name}] at http://${options.serviceHost}/${identifier}`);
    }
  }
};

const shutdownServices = async (emulators: EmulatorServices) => {
  for (const identifier in emulators) {
    const emulator = emulators[identifier];

    if (emulator.shutdownHandler) {
      await emulator.shutdownHandler();
    }
  }
};
