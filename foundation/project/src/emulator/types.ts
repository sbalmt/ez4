import type { AnyServiceDescriptor, ServiceReferences } from '@ez4/emulator';
import type { EmulatorServiceManifest } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';
import type { LinkedService, LinkedServices, ServiceMetadata } from '../types/service';
import type { ServeOptions } from '../types/options';

export type EmulatorDescriptorHandler = (options?: AnyObject) => EmulatorServiceDescriptor;

export type EmulatorManifestHandler = () => EmulatorServiceManifest<AnyObject>;

export type EmulatorPrepareHandler = () => Promise<void> | void;

export type EmulatorBootstrapHandler = () => Promise<void> | void;

export type EmulatorShutdownHandler = () => Promise<void> | void;

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
  name: string;
  identifier: string;
  options?: AnyObject;
  inheritOptions?: boolean;
  exportDescriptor?: EmulatorDescriptorHandler;
  manifestHandler?: EmulatorManifestHandler;
  prepareHandler?: EmulatorPrepareHandler;
  bootstrapHandler?: EmulatorBootstrapHandler;
  shutdownHandler?: EmulatorShutdownHandler;
  connectHandler?: EmulatorConnectionHandler;
  disconnectHandler?: EmulatorConnectionHandler;
  messageHandler?: EmulatorMessageHandler;
  requestHandler?: EmulatorRequestHandler;
};

export type EmulatorLinkedServices = Record<string, LinkedService>;

export type EmulatorServiceDescriptor = AnyServiceDescriptor & {
  dependencies?: LinkedServices;
};

export type EmulateServiceContext = {
  makeService: (resourceName: string, resourceOptions?: AnyObject) => Promise<unknown>;
  makeReferences: (linkedServices: EmulatorLinkedServices, linkedReferences?: string[], linkedOptions?: AnyObject) => ServiceReferences;
  makeDescriptors: (linkedServices: EmulatorLinkedServices) => Record<string, EmulatorServiceDescriptor>;
};

export type EmulateServiceEvent = {
  context: EmulateServiceContext;
  service: ServiceMetadata;
  options: ServeOptions;
};

export type EmulateDescriptorEvent = {
  service: ServiceMetadata;
  options: ServeOptions;
};
