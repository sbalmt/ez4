export const escapeSqlNames = (names: string[]) => {
  return names.map((name) => escapeSqlName(name)).join(', ');
};

export const escapeSqlName = (name: string) => {
  return `"${name.replaceAll('"', '')}"`;
};

export const escapeSqlText = (name: string) => {
  return `'${name.replaceAll("'", '')}'`;
};
