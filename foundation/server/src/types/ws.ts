export const enum WsState {
  Pending = 0x00,
  Connected = 0x01,
  Disconnected = 0x02
}

export const enum WsOpcode {
  Continue = 0x00,
  Text = 0x01,
  Binary = 0x02,
  Close = 0x08,
  Ping = 0x09,
  Pong = 0x0a
}

export const enum WsCloseCode {
  ProtocolError = 1002,
  MessageTooBig = 1009
}
