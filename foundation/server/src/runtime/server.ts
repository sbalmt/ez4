import type { ServerInstance, ServerOptions } from '../types/server';

import { createServer } from 'node:http';

import { Logger } from '@ez4/logger';

import { getServerAddress, getServerHost, getServerPort } from '../utils/options';
import { requestHandler } from './http';
import { upgradeHandler } from './ws';

export const startServer = (options: ServerOptions) => {
  const server = createServer();

  const bindHost = getServerHost(options);
  const bindPort = getServerPort(options);

  server.on('upgrade', (request, socket, head) => {
    upgradeHandler(request, socket, head, options);
  });

  server.on('request', (request, stream) => {
    requestHandler(request, stream, options);
  });

  return new Promise<ServerInstance>((resolve, reject) => {
    const address = getServerAddress(options);

    server.on('error', (error) => {
      Logger.error(`Unable to serve project [${options.name}] at http://${address}`);
      reject(error);
    });

    server.listen(bindPort, bindHost, () => {
      Logger.log(`🚀 Project [${options.name}] up and running`);

      resolve({
        close: () => {
          return new Promise<void>((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
          });
        }
      });
    });
  });
};
