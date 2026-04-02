/**
 * WebSocket requests.
 */
export type AllRequests = EchoRequest | CloseRequest | ErrorRequest;

export type EchoRequest = {
  type: RequestType.Echo;
  value: string;
};

export type CloseRequest = {
  type: RequestType.Close;
};

export type ErrorRequest = {
  type: RequestType.Error;
};

export const enum RequestType {
  Echo = 'echo',
  Close = 'close',
  Error = 'error'
}
