type OutputState = {
  capture: number;
  buffer: string[];
  lines: number;
};

const OUTPUT: OutputState = {
  capture: 0,
  buffer: [],
  lines: 0
};

export namespace TTY {
  export const startBuffer = () => {
    OUTPUT.capture++;
  };

  export const isBuffering = () => {
    return OUTPUT.capture > 0;
  };

  export const hasBuffer = () => {
    return OUTPUT.capture === 0 && OUTPUT.buffer.length > 0;
  };

  export const getBuffer = () => {
    const buffer = OUTPUT.buffer;

    OUTPUT.buffer = [];

    return buffer;
  };

  export const stopBuffer = () => {
    if (OUTPUT.capture > 0) {
      OUTPUT.capture--;
    }
  };

  export const getCurrentLine = () => {
    return OUTPUT.lines;
  };

  export const setup = () => {
    if (process.stdout.write !== safeWrite) {
      process.stdout.write = safeWrite;
    }
  };

  const rawWrite = process.stdout.write.bind(process.stdout);

  const safeWrite = (string: Uint8Array | string, ...rest: any[]) => {
    const message = string.toString();

    if (OUTPUT.capture > 0) {
      OUTPUT.buffer.push(message);
      return true;
    }

    const matches = message.match(/\n/g);

    if (matches) {
      OUTPUT.lines += matches.length;
    }

    return rawWrite(string, ...rest);
  };
}
