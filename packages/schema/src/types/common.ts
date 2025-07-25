export type SchemaDefinitions = {};

export const enum NamingStyle {
  CamelCase = 'camel',
  PascalCase = 'pascal',
  SnakeCase = 'snake',
  KebabCase = 'kebab'
}

export const enum SchemaType {
  Boolean = 'boolean',
  Number = 'number',
  String = 'string',
  Object = 'object',
  Reference = 'reference',
  Union = 'union',
  Array = 'array',
  Tuple = 'tuple',
  Enum = 'enum'
}
