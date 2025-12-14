import type { ServiceMetadata } from '../types/service';
import type { ServeOptions } from '../types/options';

export type EmulatorExportHandler = () => unknown;

export type EmulatorPrepareHandler = () => unknown;

export type EmulatorBootstrapHandler = () => unknown;

export type EmulatorShutdownHandler = () => unknown;

export type EmulatorConnectionHandler = (event: EmulatorConnectionEvent) => Promise<void> | void;

export type EmulatorMessageHandler = (event: EmulatorMessageEvent) => Promise<Buffer | string | void> | Buffer | string | void;

export type EmulatorRequestHandler = (event: EmulatorRequestEvent) => Promise<EmulatorResponse | void> | EmulatorResponse | void;

export type EmulatorConnectionEvent = {
  connection: EmulatorConnection;
  headers: Record<string, string>;
  query?: Record<string, string>;
};

export type EmulatorMessageEvent = {
  connection: EmulatorConnection;
  body: Buffer;
};

export type EmulatorRequestEvent = {
  method: string;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body?: Buffer;
};

export type EmulatorConnection = {
  readonly id: string;
  readonly live: boolean;
  write: (data: Buffer | string) => void;
  close(): void;
};

export type EmulatorResponse = {
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
  connectHandler?: EmulatorConnectionHandler;
  disconnectHandler?: EmulatorConnectionHandler;
  messageHandler?: EmulatorMessageHandler;
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
