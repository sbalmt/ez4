import { WsCode } from '../types/ws';

export class WsCloseError extends Error {
  constructor(
    public readonly code: WsCode,
    message: string
  ) {
    super(message);
  }
}

export class WsFrameTooBigError extends WsCloseError {
  constructor(limit: number) {
    super(WsCode.MessageTooBig, `WebSocket frame exceeds the ${limit} bytes limit.`);
  }
}

export class WsUnexpectedFrameError extends WsCloseError {
  constructor(message: string) {
    super(WsCode.ProtocolError, message);
  }
}
