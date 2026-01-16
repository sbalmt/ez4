import type { DynamoDBClient, GlobalSecondaryIndex } from '@aws-sdk/client-dynamodb';
import type { AttributeSchemaGroup } from '../../types/schema';

import { DescribeTableCommand, IndexStatus, ProjectionType } from '@aws-sdk/client-dynamodb';
import { Wait } from '@ez4/utils';

import { getIndexName } from '../../types/indexes';
import { getAttributeKeyTypes } from './schema';

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
  await Wait.until(async () => {
    const result = await getSecondaryIndexStatus(client, tableName, indexName);

    if (result && result.IndexStatus !== IndexStatus.ACTIVE) {
      return Wait.RetryAttempt;
    }

    return true;
  });
};

export const getSecondaryIndexName = (schema: AttributeSchemaGroup) => {
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
