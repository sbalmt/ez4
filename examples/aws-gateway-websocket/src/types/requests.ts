/**
 * WebSocket requests.
 */
export type AllRequests = EchoRequest | CloseRequest;

export type EchoRequest = {
  type: RequestType.Echo;
  value: string;
};

export type CloseRequest = {
  type: RequestType.Close;
};

export const enum RequestType {
  Echo = 'echo',
  Close = 'close'
}


