import type { FieldParameter } from './fields';

export const prepareStatement = (query: string, variables?: FieldParameter[]): [string, unknown[] | undefined] => {
  if (!variables?.length) {
    return [query, undefined];
  }

  const preparedValues: unknown[] = [];
  const fieldIndexes: Record<string, number> = {};

  const fieldParameters = variables.reduce<Record<string, FieldParameter>>((map, variable) => {
    map[variable.name] = variable;
    return map;
  }, {});

  let totalFields = 0;

  const preparedQuery = query.replaceAll(/:(\w+)/g, (occurrence, fieldName) => {
    const parameter = fieldParameters[fieldName];

    if (!parameter) {
      return occurrence;
    }

    const { type, value } = parameter;

    if (!fieldIndexes[fieldName]) {
      fieldIndexes[fieldName] = ++totalFields;
      preparedValues.push(value);
    }

    const index = fieldIndexes[fieldName];

    if (type) {
      return `$${index}::${type}`;
    }

    return `$${index}`;
  });

  return [preparedQuery, preparedValues];
};
