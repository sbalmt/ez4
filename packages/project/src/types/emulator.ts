export type EmulatorService = {
  type: string;
  identifier: string;
  name: string;
  requestHandler?: EmulatorRequestHandler;
  clientMaker?: EmulatorClientMaker;
};

export type EmulatorRequestHandler = (
  request: EmulatorServiceRequest
) => Promise<EmulatorHandlerResponse | undefined> | EmulatorHandlerResponse | undefined;

export type EmulatorClientMaker = () => unknown;

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

export type EmulateServiceContext = {
  makeClient: (serviceName: string) => unknown;
};
