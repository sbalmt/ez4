import type { AttributeSchema } from '../../types/schema.js';

export const getAttributeTypes = (schema: AttributeSchema[]) => {
  return schema.map(({ attributeName, attributeType }) => ({
    AttributeName: attributeName,
    AttributeType: attributeType
  }));
};

export const getAttributeKeyTypes = (schema: AttributeSchema[]) => {
  const keyTypes = [];

  for (const { attributeName, keyType } of schema) {
    keyTypes.push({
      AttributeName: attributeName,
      KeyType: keyType
    });
  }

  return keyTypes;
};
