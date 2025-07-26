import { NamingStyle } from '../types/naming.js';

import { toCamelCase, toKebabCase, toPascalCase, toSnakeCase } from '@ez4/utils';

export const getPropertyName = (property: string, namingStyle?: NamingStyle) => {
  switch (namingStyle) {
    case NamingStyle.CamelCase:
      return toCamelCase(property);

    case NamingStyle.PascalCase:
      return toPascalCase(property);

    case NamingStyle.SnakeCase:
      return toSnakeCase(property);

    case NamingStyle.KebabCase:
      return toKebabCase(property);

    default:
      return property;
  }
};
