import type { LogColor } from '../types/color';

const Reset = '\x1b[0m';
const Bold = '\x1b[1m';

export namespace LogFormat {
  export const toBold = (text: string) => {
    return Bold + text + Reset;
  };

  export const toColor = (color: LogColor, text: string) => {
    return color + text + Reset;
  };
}
