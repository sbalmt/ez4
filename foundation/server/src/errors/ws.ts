import { WsCloseCode } from '../types/ws';

export class WsCloseError extends Error {
  constructor(
    public readonly code: WsCloseCode,
    message: string
  ) {
    super(message);
  }
}

export class WsFrameTooBigError extends WsCloseError {
  constructor(limit: number) {
    super(WsCloseCode.MessageTooBig, `WebSocket frame exceeds the ${limit} bytes limit.`);
  }
}

export class WsUnexpectedFrameError extends WsCloseError {
  constructor(message: string) {
    super(WsCloseCode.ProtocolError, message);
  }
}
