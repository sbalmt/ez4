import type { ServerOptions } from '../types/server';

export const getServerHost = (options: Pick<ServerOptions, 'host'>) => {
  return options.host ?? '0.0.0.0';
};

export const getServerPort = (options: Pick<ServerOptions, 'port'>) => {
  return options.port ?? 3734;
};

export const getServerAddress = (options: Pick<ServerOptions, 'host' | 'port'>) => {
  return `${options.host ?? 'localhost'}:${getServerPort(options)}`;
};
