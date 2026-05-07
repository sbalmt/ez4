export const formatUri = (path: string) => {
  if (!path.startsWith('/')) {
    return `/${path}`;
  }

  return path;
};

export const combineUri = (...paths: string[]) => {
  const pathParts = paths.map((path) => {
    const startSeparator = path.startsWith('/');
    const endSeparator = path.endsWith('/');

    if (startSeparator && endSeparator) {
      return path.substring(1, path.length - 1);
    }

    if (endSeparator) {
      return path.substring(0, path.length - 1);
    }

    if (startSeparator) {
      return path.substring(1);
    }

    return path;
  });

  return `/${pathParts.join('/')}`;
};
