export const transformNumber = (value: unknown) => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const result = Number(value);

    if (!Number.isNaN(result) && Number.isFinite(result)) {
      return result;
    }
  }

  return undefined;
};
