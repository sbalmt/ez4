export type SchemaDefinitions = {
  custom?: boolean;
  type?: string;
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
