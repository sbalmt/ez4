export type EmulatorClientHandler = () => unknown;

export type EmulatorBootstrapHandler = () => unknown;

export type EmulatorRequestHandler = (
  request: EmulatorServiceRequest
) => Promise<EmulatorHandlerResponse | undefined> | EmulatorHandlerResponse | undefined;

export type EmulatorServiceRequest = {
  method: string;
  path: string;
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

export type EmulateServiceContext = {
  makeAllClients: (serviceNames: string[]) => Record<string, unknown>;
  makeClient: (serviceName: string) => unknown;
};
