export type SchemaDefinitions = {
  custom?: boolean;
};

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
