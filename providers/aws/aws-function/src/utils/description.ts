export const getSafeDescription = (description: string) => {
  const line = description
    .replaceAll(/[\t\n]/g, ' ')
    .replaceAll('\r', '')
    .trim();

  if (line.length > 256) {
    return line.substring(0, 253).trim() + '...';
  }

  return line;
};
