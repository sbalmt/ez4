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

export const enum WebSocketOpcode {
  Continue = 0x00,
  Text = 0x01,
  Binary = 0x02,
  Close = 0x08,
  Ping = 0x09,
  Pong = 0x0a
}

export namespace WebSocketUtils {
  export const decodeOpcode = (buffer: Buffer) => {
    const opcode = buffer[0] & OPCODE_MASK;

    switch (opcode) {
      case WebSocketOpcode.Continue:
      case WebSocketOpcode.Text:
      case WebSocketOpcode.Binary:
      case WebSocketOpcode.Close:
      case WebSocketOpcode.Ping:
      case WebSocketOpcode.Pong:
        return opcode;
    }

    return undefined;
  };

  export const decodeDataFrame = (buffer: Buffer, offset: number) => {
    const headerFrame = decodeFrameHeader(buffer, offset);

    if (!headerFrame) {
      return undefined;
    }

    const { dataOffset, maskOffset, frameLength } = headerFrame;

    if (buffer.length < frameLength) {
      return undefined;
    }

    const masking = buffer.subarray(dataOffset, maskOffset);
    const data = buffer.subarray(maskOffset, frameLength);

    for (let index = 0; index < data.length; index++) {
      data[index] ^= masking[index % 4];
    }

    return {
      length: frameLength,
      data
    };
  };

  export const encodeTextFrame = (text: Buffer) => {
    return Buffer.concat([encodeFrameHeader(text.length), text]);
  };

  export const encodeCloseFrame = () => {
    return Buffer.from([FIN_CODE | WebSocketOpcode.Close, 0x00]);
  };

  const encodeFrameHeader = (length: number) => {
    const header = Buffer.allocUnsafe(HEADER_BYTES);

    let offset = 0;

    header.writeUint8(FIN_CODE | WebSocketOpcode.Text, offset++);

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

  const decodeFrameHeader = (header: Buffer, offset: number) => {
    const length = header[offset++] & LENGTH_MASK;

    if (length <= TINY_SIZE) {
      const maskOffset = offset + MASK_BYTES;

      return {
        frameLength: maskOffset + length,
        dataOffset: offset,
        maskOffset
      };
    }

    if (length === REGULAR_CODE) {
      const nextOffset = offset + REGULAR_BYTES;

      if (header.length >= nextOffset) {
        const maskOffset = nextOffset + MASK_BYTES;

        return {
          frameLength: maskOffset + header.readUInt16BE(offset),
          dataOffset: nextOffset,
          maskOffset
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
          maskOffset
        };
      }
    }

    return undefined;
  };
}
