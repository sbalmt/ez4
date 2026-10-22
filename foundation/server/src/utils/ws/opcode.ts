import { WsOpcode } from '../../types/ws';

export const isWsOpcode = (opcode: number): opcode is WsOpcode => {
  switch (opcode) {
    case WsOpcode.Continue:
    case WsOpcode.Text:
    case WsOpcode.Binary:
    case WsOpcode.Close:
    case WsOpcode.Ping:
    case WsOpcode.Pong:
      return true;
  }

  return false;
};
