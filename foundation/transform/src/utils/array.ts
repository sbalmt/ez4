export const stringToArray = (input: string): string[] => {
  return input
    .split(',')
    .map((value) => value.trim())
    .filter((value) => !!value.length);
};
