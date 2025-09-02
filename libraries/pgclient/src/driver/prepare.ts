import type { FieldParameter } from './fields';

export const prepareStatement = (query: string, variables?: FieldParameter[]): [string, unknown[] | undefined] => {
  if (!variables?.length) {
    return [query, undefined];
  }

  const variableFields = new Set(variables.map(({ name }) => name));
  const preparedValues = variables.map(({ value }) => value);

  let counter = 0;

  const preparedQuery = query.replaceAll(/:(\w+)/g, (occurrence, fieldName) => {
    if (!variableFields.has(fieldName)) {
      return occurrence;
    }

    const type = variables[counter++]?.type;

    if (type) {
      return `$${counter}::${type}`;
    }

    return `$${counter}`;
  });

  return [preparedQuery, preparedValues];
};
