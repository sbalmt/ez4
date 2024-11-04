import type { DynamoDBClient, GlobalSecondaryIndex } from '@aws-sdk/client-dynamodb';
import type { AttributeSchema, AttributeSchemaGroup } from '../../types/schema.js';

import { DescribeTableCommand, IndexStatus, ProjectionType } from '@aws-sdk/client-dynamodb';
import { toKebabCase, waitFor } from '@ez4/utils';

import { getAttributeKeyTypes } from './schema.js';

export const getSecondaryIndexes = (...groups: AttributeSchemaGroup[]) => {
  const indexList: GlobalSecondaryIndex[] = [];

  for (const schema of groups) {
    indexList.push({
      IndexName: `${getSecondaryIndexName(schema)}-index`,
      KeySchema: getAttributeKeyTypes(schema),
      Projection: {
        ProjectionType: ProjectionType.ALL
      }
    });
  }

  return indexList;
};

export const waitForSecondaryIndex = async (
  client: DynamoDBClient,
  tableName: string,
  indexName: string
) => {
  await waitFor(async () => {
    const result = await getSecondaryIndexStatus(client, tableName, indexName);

    return !result || result.IndexStatus === IndexStatus.ACTIVE;
  });
};

const getSecondaryIndexName = (schema: AttributeSchema[]) => {
  const indexNames = schema.map(({ attributeName }) => attributeName);

  return toKebabCase(indexNames.join('-'));
};

const getSecondaryIndexStatus = async (
  client: DynamoDBClient,
  tableName: string,
  indexName: string
) => {
  const { Table } = await client.send(
    new DescribeTableCommand({
      TableName: tableName
    })
  );

  return Table?.GlobalSecondaryIndexes?.find((index) => {
    return index.IndexName === indexName;
  });
};
