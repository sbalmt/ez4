import type { AttributeDefinition } from '@aws-sdk/client-dynamodb';
import type { AttributeSchema } from '../../types/schema.js';

export const getAttributeDefinitions = (schema: AttributeSchema[]): AttributeDefinition[] => {
  const attributeCache = new Set();
  const attributeList = [];

  for (const { attributeName, attributeType } of schema) {
    if (attributeCache.has(attributeName)) {
      continue;
    }

    attributeCache.add(attributeName);

    attributeList.push({
      AttributeName: attributeName,
      AttributeType: attributeType
    });
  }

  return attributeList;
};

export const getAttributeKeyTypes = (schema: AttributeSchema[]) => {
  return schema.map(({ attributeName, keyType }) => ({
    AttributeName: attributeName,
    KeyType: keyType
  }));
};
