export const transformString = (value: unknown) => {
  if (typeof value === 'string') {
    return value;
  }

  return undefined;
};
