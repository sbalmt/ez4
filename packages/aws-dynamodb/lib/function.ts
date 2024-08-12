import type { DynamoDBStreamEvent, Context, DynamoDBRecord } from 'aws-lambda';
import type { ObjectSchema } from '@ez4/schema';
import type { StreamChange } from '@ez4/database';

import { unmarshall } from '@aws-sdk/util-dynamodb';
import { getJsonChanges } from '@ez4/aws-dynamodb/runtime';
import { StreamType } from '@ez4/database';

declare function next(changes: StreamChange<object>, context: object): Promise<any>;

declare const __EZ4_SCHEMA: ObjectSchema | null;
declare const __EZ4_CONTEXT: object;

/**
 * Entrypoint to handle DynamoDB stream events.
 */
export async function dbStreamEntryPoint(
  event: DynamoDBStreamEvent,
  context: Context
): Promise<void> {
  if (!__EZ4_SCHEMA) {
    throw new Error(`Validation schema for table is not defined.`);
  }

  for (const record of event.Records) {
    const change = await getChangeRecord(record, __EZ4_SCHEMA);

    if (change) {
      await next(change, __EZ4_CONTEXT);
    }
  }
}

const getChangeRecord = async (
  record: DynamoDBRecord,
  schema: ObjectSchema
): Promise<StreamChange<object> | null> => {
  const { eventName, dynamodb } = record;

  if (!dynamodb) {
    return null;
  }

  const newImage = dynamodb.NewImage as any;
  const oldImage = dynamodb.OldImage as any;

  switch (eventName) {
    case 'INSERT': {
      if (!newImage) {
        break;
      }

      return {
        type: StreamType.Insert,
        record: await getJsonChanges(unmarshall(newImage), schema)
      };
    }

    case 'MODIFY': {
      if (!newImage || !oldImage) {
        break;
      }

      return {
        type: StreamType.Update,
        newRecord: await getJsonChanges(unmarshall(newImage), schema),
        oldRecord: await getJsonChanges(unmarshall(oldImage), schema)
      };
    }

    case 'REMOVE': {
      if (!oldImage) {
        break;
      }

      return {
        type: StreamType.Delete,
        record: await getJsonChanges(unmarshall(oldImage), schema)
      };
    }
  }

  return null;
};
