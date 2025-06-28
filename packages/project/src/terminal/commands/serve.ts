import type { IncomingMessage, ServerResponse } from 'node:http';
import type { EmulatorHandlerResponse } from '../../types/emulator.js';
import type { EmulatorServices } from '../../library/emulator.js';
import type { ProjectOptions } from '../../types/project.js';

import { createServer } from 'node:http';

import { loadProviders } from '../../services/providers.js';
import { getMetadata } from '../../library/metadata.js';
import { getEmulators } from '../../library/emulator.js';
import { Logger } from '../../utils/logger.js';

export const serveCommand = async (project: ProjectOptions) => {
  await Logger.execute('Loading providers', () => {
    return loadProviders(project);
  });

  const { metadata } = await Logger.execute('Loading metadata', () => {
    return getMetadata(project.sourceFiles);
  });

  const { emulators } = await getEmulators(metadata, project);

  const server = createServer((request, stream) => {
    const service = getRequestService(emulators, request);

    if (!service?.emulator) {
      sendErrorResponse(stream, 422, 'Service emulator not found.');
      return;
    }

    const buffer: Buffer[] = [];

    request.on('data', (chunk) => {
      buffer.push(chunk);
    });

    request.on('end', async () => {
      try {
        const response = await service.emulator.requestHandler({
          method: request.method ?? 'GET',
          body: buffer.length ? Buffer.concat(buffer) : undefined,
          headers: service.headers,
          path: service.path
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

  server.listen(3734, () => {
    Logger.log(`Project ${project.projectName} ready!`);
  });
};

const getRequestService = (emulator: EmulatorServices, request: IncomingMessage) => {
  if (!request.url) {
    return undefined;
  }

  const { pathname, searchParams } = new URL(request.url, 'http://localhost');

  const [, identifier, path = ''] = pathname.split('/', 3);

  return {
    identifier,
    emulator: emulator[identifier],
    headers: getDistinctHeaders(request.headersDistinct),
    query: searchParams,
    path: `/${path}`
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
