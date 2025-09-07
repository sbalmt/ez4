export const getIsNullOperation = (column: string, operand: unknown) => {
  if (!operand) {
    return `${column} IS NOT null`;
  }

  return `${column} IS null`;
};
