export const enum KeyType {
  Hash = 'HASH',
  Range = 'RANGE'
}

export const enum AttributeType {
  Boolean = 'B',
  Number = 'N',
  String = 'S'
}

export type SchemaDefinition = {
  attributeName: string;
  attributeType: AttributeType;
  keyType?: KeyType;
};
