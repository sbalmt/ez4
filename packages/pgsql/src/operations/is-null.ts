export const getIsNullOperation = (column: string, value: unknown) => {
  return `${column} IS ${value ? 'null' : 'NOT null'}`;
};
