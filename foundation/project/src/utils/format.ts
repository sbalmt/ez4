const Reset = '\x1b[0m';
const Bold = '\x1b[1m';

export const enum Color {
  Black = '\x1b[30m',
  Red = '\x1b[31m',
  Green = '\x1b[32m',
  Yellow = '\x1b[33m',
  Blue = '\x1b[34m',
  Magenta = '\x1b[35m',
  Cyan = '\x1b[36m',
  White = '\x1b[37m',
  BrightBlack = '\x1b[90m',
  BrightRed = '\x1b[91m',
  BrightGreen = '\x1b[92m',
  BrightYellow = '\x1b[93m',
  BrightBlue = '\x1b[94m',
  BrightMagenta = '\x1b[95m',
  BrightCyan = '\x1b[96m',
  BrightWhite = '\x1b[97m'
}

export const toBold = (text: string) => {
  return Bold + text + Reset;
};

export const toColor = (color: Color, text: string) => {
  return color + text + Reset;
};

export const toRed = (text: string) => {
  return toColor(Color.Red, text);
};

export const toGreen = (text: string) => {
  return toColor(Color.Green, text);
};

export const toYellow = (text: string) => {
  return toColor(Color.Yellow, text);
};
