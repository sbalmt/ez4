import type { ProjectServeOptions } from '../types/project';

export const getServicePort = (options?: ProjectServeOptions) => {
  return options?.localPort ?? 3734;
};

export const getServiceAddress = (options?: ProjectServeOptions) => {
  return options?.localHost ?? '0.0.0.0';
};

export const getServiceHost = (options?: ProjectServeOptions) => {
  const serviceHost = options?.localHost ?? 'localhost';

  return `${serviceHost}:${getServicePort(options)}`;
};
