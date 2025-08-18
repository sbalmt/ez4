export const prepareCreateDatabase = (database: string) => {
  return {
    query: `CREATE DATABASE "${database}"`
  };
};

export const prepareDeleteDatabase = (database: string) => {
  return {
    query: `DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`
  };
};
