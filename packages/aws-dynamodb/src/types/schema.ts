export const enum AttributeKeyType {
  Hash = 'HASH',
  Range = 'RANGE'
}

export const enum AttributeType {
  Boolean = 'B',
  Number = 'N',
  String = 'S'
}

export type AttributeSchema = {
  attributeName: string;
  attributeType: AttributeType;
  keyType: AttributeKeyType;
};
