export const prepareCreateDatabase = (database: string): string => {
  return `CREATE DATABASE "${database}"`;
};

export const prepareDeleteDatabase = (database: string): string => {
  return `DROP DATABASE "${database}"`;
};
