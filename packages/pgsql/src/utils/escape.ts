export const escapeSqlName = (name: string) => {
  return `"${name.replaceAll('"', '')}"`;
};

export const escapeSqlText = (name: string) => {
  return `'${name.replaceAll("'", '')}'`;
};
