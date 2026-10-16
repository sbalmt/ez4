import type { ServerOptions } from '../types/server';

export const getServerPort = (options: ServerOptions) => {
  return options.port ?? 3734;
};

export const getServerHost = (options: ServerOptions) => {
  return options.host ?? '0.0.0.0';
};

export const getServerAddress = (options: ServerOptions) => {
  return `${options.host ?? 'localhost'}:${getServerPort(options)}`;
};
