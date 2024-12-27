export const escapeName = (name: string) => {
  return `"${name.replaceAll('"', '')}"`;
};

export const escapeText = (name: string) => {
  return `'${name.replaceAll("'", '')}'`;
};

export const mergePath = (column: string, path: string | undefined) => {
  return path ? `${path}[${escapeText(column)}]` : escapeName(column);
};

export const mergeAlias = (column: string, alias: string | undefined) => {
  return alias ? `${escapeName(alias)}.${column}` : column;
};
