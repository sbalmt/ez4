import type { ServiceMetadata } from '../types/service';
import type { ServeOptions } from '../types/options';

export type EmulatorExportHandler = () => unknown;

export type EmulatorPrepareHandler = () => unknown;

export type EmulatorBootstrapHandler = () => unknown;

export type EmulatorShutdownHandler = () => unknown;

export type EmulatorRequestHandler = (
  request: EmulatorServiceRequest
) => Promise<EmulatorHandlerResponse | void> | EmulatorHandlerResponse | void;

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

export type ServiceEmulator = {
  type: string;
  identifier: string;
  name: string;
  exportHandler?: EmulatorExportHandler;
  prepareHandler?: EmulatorPrepareHandler;
  bootstrapHandler?: EmulatorBootstrapHandler;
  shutdownHandler?: EmulatorShutdownHandler;
  requestHandler?: EmulatorRequestHandler;
};

export type ServiceEmulatorClients = Record<string, unknown>;

export type LinkedServiceEmulators = Record<string, string>;

export type EmulateServiceContext = {
  makeClients: (linkedServices: LinkedServiceEmulators) => ServiceEmulatorClients;
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
