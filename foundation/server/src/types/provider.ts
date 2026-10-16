export type ProviderOptions = HttpProviderOptions | WsProviderOptions;

export const enum ProviderType {
  Http = 'http',
  Ws = 'ws'
}

export type HttpProviderOptions = {
  type: ProviderType.Http;
  requestHandler: (request: HttpProviderRequest) => Promise<HttpProviderResponse | void> | HttpProviderResponse | void;
};

export type WsProviderOptions = {
  type: ProviderType.Ws;
  connectHandler: (connection: WsProviderConnection) => Promise<void> | void;
  messageHandler: (message: WsProviderMessage) => Promise<string | void> | string | void;
  disconnectHandler: (connection: WsProviderConnection) => Promise<void> | void;
};

export type HttpProviderRequest = {
  path: string;
  method: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: Buffer | string;
};

export type HttpProviderResponse = {
  status: number;
  headers?: Record<string, string>;
  body?: Buffer | string;
};

export type WsProviderClient = {
  readonly id: string;
  readonly live: boolean;
  write: (data: string) => void;
  close(): Promise<void>;
};

export type WsProviderConnection = {
  id: string;
  headers: Record<string, string>;
  query?: Record<string, string>;
};

export type WsProviderMessage = {
  client: WsProviderClient;
  body: Buffer;
};
