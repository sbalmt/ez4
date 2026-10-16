export const enum WebSocketState {
  Pending,
  Connected,
  Disconnected
}

export const enum WebSocketOpcode {
  Continue = 0x00,
  Text = 0x01,
  Binary = 0x02,
  Close = 0x08,
  Ping = 0x09,
  Pong = 0x0a
}
