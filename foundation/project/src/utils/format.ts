const Reset = '\x1b[0m';
const Bold = '\x1b[1m';

export const enum Color {
  Red = '\x1b[31m',
  Green = '\x1b[32m',
  Yellow = '\x1b[33m',
  Gray = '\x1b[90m'
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

export const toGray = (text: string) => {
  return toColor(Color.Gray, text);
};
