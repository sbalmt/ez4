import type { DynamoDBClient, GlobalSecondaryIndex } from '@aws-sdk/client-dynamodb';
import type { AttributeSchema, AttributeSchemaGroup } from '../../types/schema.js';

import { DescribeTableCommand, IndexStatus, ProjectionType } from '@aws-sdk/client-dynamodb';
import { waitFor } from '@ez4/utils';

import { getIndexName } from '../../types/indexes.js';
import { getAttributeKeyTypes } from './schema.js';

export const getSecondaryIndexes = (...groups: AttributeSchemaGroup[]) => {
  const indexList: GlobalSecondaryIndex[] = [];

  for (const schema of groups) {
    indexList.push({
      IndexName: getSecondaryIndexName(schema),
      KeySchema: getAttributeKeyTypes(schema),
      Projection: {
        ProjectionType: ProjectionType.ALL
      }
    });
  }

  return indexList;
};

export const waitForSecondaryIndex = async (client: DynamoDBClient, tableName: string, indexName: string) => {
  await waitFor(async () => {
    const result = await getSecondaryIndexStatus(client, tableName, indexName);

    return !result || result.IndexStatus === IndexStatus.ACTIVE;
  });
};

export const getSecondaryIndexName = (schema: AttributeSchema[]) => {
  const indexParts = schema.map(({ attributeName }) => attributeName);

  return getIndexName(indexParts);
};

const getSecondaryIndexStatus = async (client: DynamoDBClient, tableName: string, indexName: string) => {
  const { Table } = await client.send(
    new DescribeTableCommand({
      TableName: tableName
    })
  );

  return Table?.GlobalSecondaryIndexes?.find((index) => {
    return index.IndexName === indexName;
  });
};
