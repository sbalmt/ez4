export const formatTime = (milliseconds: number) => {
  if (milliseconds >= 500) {
    return `${(milliseconds / 1000).toFixed(2)}s`;
  }

  return `${milliseconds}ms`;
};
