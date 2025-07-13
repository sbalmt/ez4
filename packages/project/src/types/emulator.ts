import type { ServiceMetadata } from './service.js';
import type { ServeOptions } from './options.js';

export type EmulatorClientHandler = () => unknown;

export type EmulatorBootstrapHandler = () => unknown;

export type EmulatorRequestHandler = (
  request: EmulatorServiceRequest
) => Promise<EmulatorHandlerResponse | undefined> | EmulatorHandlerResponse | undefined;

export type EmulatorServiceRequest = {
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body?: Buffer;
};

export type EmulatorHandlerResponse = {
  status: number;
  headers?: Record<string, string>;
  body?: Buffer | string;
};

export type EmulatorService = {
  type: string;
  identifier: string;
  name: string;
  clientHandler?: EmulatorClientHandler;
  bootstrapHandler?: EmulatorBootstrapHandler;
  requestHandler?: EmulatorRequestHandler;
};

export type EmulatorServiceClients = Record<string, unknown>;

export type EmulatorLinkedServices = Record<string, string>;

export type EmulateServiceContext = {
  makeClients: (linkedServices: EmulatorLinkedServices) => EmulatorServiceClients;
  makeClient: (serviceName: string) => unknown;
};

export type EmulateServiceEvent = {
  context: EmulateServiceContext;
  service: ServiceMetadata;
  options: ServeOptions;
};

export type EmulateClientEvent = {
  service: ServiceMetadata;
  options: ServeOptions;
};
