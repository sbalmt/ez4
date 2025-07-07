export const enum AttributeKeyType {
  Hash = 'HASH',
  Range = 'RANGE'
}

export const enum AttributeType {
  Binary = 'B',
  Number = 'N',
  String = 'S'
}

export type AttributeSchemaGroup = AttributeSchema[];

export type AttributeSchema = {
  attributeName: string;
  attributeType: AttributeType;
  keyType: AttributeKeyType;
};
