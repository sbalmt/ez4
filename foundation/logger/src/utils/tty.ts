export namespace TTY {
  type InternalState = {
    capture: number;
    buffer: string[];
    lines: number;
  };

  const STATE: InternalState = {
    capture: 0,
    buffer: [],
    lines: 0
  };

  export const startBuffer = () => {
    STATE.capture++;
  };

  export const isBuffering = () => {
    return STATE.capture > 0;
  };

  export const hasBuffer = () => {
    return STATE.capture === 0 && STATE.buffer.length > 0;
  };

  export const getBuffer = () => {
    const buffer = STATE.buffer;

    STATE.buffer = [];

    return buffer;
  };

  export const stopBuffer = () => {
    if (STATE.capture > 0) {
      STATE.capture--;
    }
  };

  export const getCurrentLine = () => {
    return STATE.lines;
  };

  export const setup = () => {
    if (process.stdout.write !== safeOutputWrite) {
      process.stdout.write = safeOutputWrite;
    }

    if (process.stderr.write !== safeErrorWrite) {
      process.stderr.write = safeErrorWrite;
    }
  };

  const rawOutputWrite = process.stdout.write.bind(process.stdout);
  const rawErrorWrite = process.stderr.write.bind(process.stderr);

  const safeOutputWrite = (string: Uint8Array | string, ...rest: any[]) => {
    return safeWrite(string, () => rawOutputWrite(string, ...rest));
  };

  const safeErrorWrite = (string: Uint8Array | string, ...rest: any[]) => {
    return safeWrite(string, () => rawErrorWrite(string, ...rest));
  };

  const safeWrite = (string: Uint8Array | string, rawWrite: () => boolean) => {
    const message = string.toString();

    if (STATE.capture > 0) {
      STATE.buffer.push(message);
      return true;
    }

    const matches = message.match(/\n/g);

    if (matches) {
      STATE.lines += matches.length;
    }

    return rawWrite();
  };
}
