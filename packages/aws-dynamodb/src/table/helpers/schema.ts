import type { SchemaDefinition } from '../../types/schema.js';

export const getAttributeTypes = (schemas: SchemaDefinition[]) => {
  return schemas.map(({ attributeName, attributeType }) => ({
    AttributeName: attributeName,
    AttributeType: attributeType
  }));
};

export const getKeySchema = (schemas: SchemaDefinition[]) => {
  return schemas.map(({ attributeName, keyType }) => ({
    AttributeName: attributeName,
    KeyType: keyType
  }));
};
