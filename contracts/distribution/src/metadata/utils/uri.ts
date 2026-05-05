export const getFormattedUri = (path: string) => {
  if (!path.startsWith('/')) {
    return `/${path}`;
  }

  return path;
};
