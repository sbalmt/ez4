import type { WsCode, WsFrame } from '../../types/ws';

import { WsOpcode } from '../../types/ws';
import { WsFrameTooBigError } from '../../errors/ws';
import { isWsOpcode } from './opcode';

const OPCODE_MASK = 0x0f;
const LENGTH_MASK = 0x7f;

const HUGE_CODE = LENGTH_MASK;
const REGULAR_CODE = LENGTH_MASK - 1;
const FIN_CODE = 0x80;

const MAX_SIZE = 32768;
const REGULAR_SIZE = 65535;
const TINY_SIZE = 125;

const HUGE_BYTES = 8;
const REGULAR_BYTES = 2;
const HEADER_BYTES = 10;
const MASK_BYTES = 4;
const CLOSE_BYTES = 2;

export const encodeWsTextFrame = (data: Buffer) => {
  return Buffer.concat([encodeWsFrameHeader(WsOpcode.Text, data.length), data]);
};

export const encodeWsBinaryFrame = (data: Buffer) => {
  return Buffer.concat([encodeWsFrameHeader(WsOpcode.Binary, data.length), data]);
};

export const encodeWsCloseFrame = (code?: WsCode) => {
  if (code === undefined) {
    return Buffer.from([FIN_CODE | WsOpcode.Close, 0x00]);
  }

  const frame = Buffer.allocUnsafe(CLOSE_BYTES + CLOSE_BYTES);

  frame.writeUint8(FIN_CODE | WsOpcode.Close, 0);
  frame.writeUint8(CLOSE_BYTES, 1);
  frame.writeUInt16BE(code, CLOSE_BYTES);

  return frame;
};

export const encodeWsPongFrame = (data: Buffer) => {
  return Buffer.concat([encodeWsFrameHeader(WsOpcode.Pong, data.length), data]);
};

export const decodeWsFrame = (buffer: Buffer): WsFrame | undefined => {
  const headerFrame = decodeWsFrameHeader(buffer);

  if (!headerFrame) {
    return undefined;
  }

  const { dataOffset, maskOffset, frameLength, opcode, fin } = headerFrame;

  if (frameLength - maskOffset > MAX_SIZE) {
    throw new WsFrameTooBigError(MAX_SIZE);
  }

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
    opcode,
    fin
  };
};

const encodeWsFrameHeader = (opcode: WsOpcode, length: number) => {
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

const decodeWsFrameHeader = (header: Buffer) => {
  let offset = 0;

  const fin = (header[offset] & FIN_CODE) !== 0;

  const opcode = header[offset++] & OPCODE_MASK;
  const length = header[offset++] & LENGTH_MASK;

  if (!isWsOpcode(opcode)) {
    return undefined;
  }

  if (length <= TINY_SIZE) {
    const maskOffset = offset + MASK_BYTES;

    return {
      frameLength: maskOffset + length,
      dataOffset: offset,
      maskOffset,
      opcode,
      fin
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
        opcode,
        fin
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
        opcode,
        fin
      };
    }
  }

  return undefined;
};
