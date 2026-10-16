import { WebSocketOpcode } from '../../types/ws';

const OPCODE_MASK = 0x0f;
const LENGTH_MASK = 0x7f;

const HUGE_CODE = LENGTH_MASK;
const REGULAR_CODE = LENGTH_MASK - 1;
const FIN_CODE = 0x80;

const REGULAR_SIZE = 65535;
const TINY_SIZE = 125;

const HUGE_BYTES = 8;
const REGULAR_BYTES = 2;
const HEADER_BYTES = 10;
const MASK_BYTES = 4;

export const encodeWsTextFrame = (data: Buffer) => {
  return Buffer.concat([encodeWsFrameHeader(WebSocketOpcode.Text, data.length), data]);
};

export const encodeWsBinaryFrame = (data: Buffer) => {
  return Buffer.concat([encodeWsFrameHeader(WebSocketOpcode.Binary, data.length), data]);
};

export const encodeWsCloseFrame = () => {
  return Buffer.from([FIN_CODE | WebSocketOpcode.Close, 0x00]);
};

export const encodeWsPongFrame = (data: Buffer) => {
  return Buffer.concat([encodeWsFrameHeader(WebSocketOpcode.Pong, data.length), data]);
};

const encodeWsFrameHeader = (opcode: WebSocketOpcode, length: number) => {
  const header = Buffer.allocUnsafe(HEADER_BYTES);

  let offset = 0;

  header.writeUint8(FIN_CODE | opcode, offset++);

  if (length <= TINY_SIZE) {
    header.writeUint8(length, offset++);

    return header.subarray(0, offset);
  }

  if (length <= REGULAR_SIZE) {
    header.writeUint8(REGULAR_CODE, offset++);
    header.writeUInt16BE(length, offset);

    return header.subarray(0, offset + REGULAR_BYTES);
  }

  header.writeUint8(HUGE_CODE, offset++);
  header.writeBigUInt64BE(BigInt(length), offset);

  return header;
};

export const decodeWsFrame = (buffer: Buffer) => {
  const headerFrame = decodeWsFrameHeader(buffer);

  if (!headerFrame) {
    return undefined;
  }

  const { dataOffset, maskOffset, frameLength, opcode } = headerFrame;

  if (buffer.length < frameLength) {
    return undefined;
  }

  const masking = buffer.subarray(dataOffset, maskOffset);
  const payload = buffer.subarray(maskOffset, frameLength);

  for (let index = 0; index < payload.length; index++) {
    payload[index] ^= masking[index % 4];
  }

  return {
    length: frameLength,
    payload,
    opcode
  };
};

const decodeWsFrameHeader = (header: Buffer) => {
  let offset = 0;

  const opcode = header[offset++] & OPCODE_MASK;
  const length = header[offset++] & LENGTH_MASK;

  if (!isWsHeaderOpcode(opcode)) {
    return undefined;
  }

  if (length <= TINY_SIZE) {
    const maskOffset = offset + MASK_BYTES;

    return {
      frameLength: maskOffset + length,
      dataOffset: offset,
      maskOffset,
      opcode
    };
  }

  if (length === REGULAR_CODE) {
    const nextOffset = offset + REGULAR_BYTES;

    if (header.length >= nextOffset) {
      const maskOffset = nextOffset + MASK_BYTES;

      return {
        frameLength: maskOffset + header.readUInt16BE(offset),
        dataOffset: nextOffset,
        maskOffset,
        opcode
      };
    }
  }

  if (length === HUGE_CODE) {
    const nextOffset = offset + HUGE_BYTES;

    if (header.length >= nextOffset) {
      const maskOffset = nextOffset + MASK_BYTES;

      return {
        frameLength: maskOffset + Number(header.readBigUInt64BE(offset)),
        dataOffset: nextOffset,
        maskOffset,
        opcode
      };
    }
  }

  return undefined;
};

const isWsHeaderOpcode = (opcode: number): opcode is WebSocketOpcode => {
  switch (opcode) {
    case WebSocketOpcode.Continue:
    case WebSocketOpcode.Text:
    case WebSocketOpcode.Binary:
    case WebSocketOpcode.Close:
    case WebSocketOpcode.Ping:
    case WebSocketOpcode.Pong:
      return true;
  }

  return false;
};
