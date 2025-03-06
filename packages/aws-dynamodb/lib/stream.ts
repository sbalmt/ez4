import type { DynamoDBStreamEvent, Context, DynamoDBRecord } from 'aws-lambda';
import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import type { Database, StreamChange } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';
import type { Service } from '@ez4/common';

import { unmarshall } from '@aws-sdk/util-dynamodb';
import { validateSchema } from '@ez4/aws-dynamodb/runtime';
import { ServiceEventType } from '@ez4/common';
import { StreamType } from '@ez4/database';

declare const __EZ4_SCHEMA: ObjectSchema | null;
declare const __EZ4_CONTEXT: object;

declare function handle(changes: StreamChange<object>, context: object): Promise<any>;

declare function dispatch(
  event: Service.Event<Database.Incoming<object>>,
  context: object
): Promise<void>;

/**
 * Entrypoint to handle DynamoDB stream events.
 */
export async function dbStreamEntryPoint(
  event: DynamoDBStreamEvent,
  context: Context
): Promise<void> {
  let lastRequest: StreamChange<object> | undefined | null;

  const request = {
    requestId: context.awsRequestId
  };

  try {
    await onBegin(request);

    if (!__EZ4_SCHEMA) {
      throw new Error(`Validation schema for table is not defined.`);
    }

    for (const record of event.Records) {
      const change = await getRecordChange(record, __EZ4_SCHEMA);

      if (!change) {
        continue;
      }

      lastRequest = {
        ...request,
        ...change
      };

      await onReady(lastRequest);

      await handle(lastRequest, __EZ4_CONTEXT);
    }
  } catch (error) {
    await onError(error, lastRequest ?? request);
  } finally {
    await onEnd(request);
  }
}

const getRecordChange = async (
  record: DynamoDBRecord,
  schema: ObjectSchema
): Promise<StreamChange<object> | null> => {
  const { eventName, dynamodb } = record;

  if (!dynamodb) {
    return null;
  }

  const newImage = dynamodb.NewImage as Record<string, AttributeValue>;
  const oldImage = dynamodb.OldImage as Record<string, AttributeValue>;

  switch (eventName) {
    case 'INSERT': {
      if (newImage) {
        return getInsertRecordChange(newImage, schema);
      }

      break;
    }

    case 'MODIFY': {
      if (newImage && oldImage) {
        return getUpdateRecordChange(newImage, oldImage, schema);
      }

      break;
    }

    case 'REMOVE': {
      if (oldImage) {
        return getDeleteRecordChange(oldImage, schema);
      }

      break;
    }
  }

  return null;
};

const getInsertRecordChange = async (
  newImage: Record<string, AttributeValue>,
  schema: ObjectSchema
): Promise<StreamChange<object>> => {
  const record = unmarshall(newImage);

  await validateSchema(record, schema);

  return {
    type: StreamType.Insert,
    record
  };
};

const getUpdateRecordChange = async (
  newImage: Record<string, AttributeValue>,
  oldImage: Record<string, AttributeValue>,
  schema: ObjectSchema
): Promise<StreamChange<object>> => {
  const newRecord = unmarshall(newImage);
  const oldRecord = unmarshall(oldImage);

  await Promise.all([validateSchema(newRecord, schema), validateSchema(oldRecord, schema)]);

  return {
    type: StreamType.Update,
    newRecord,
    oldRecord
  };
};

const getDeleteRecordChange = async (
  oldImage: Record<string, AttributeValue>,
  schema: ObjectSchema
): Promise<StreamChange<object>> => {
  const record = unmarshall(oldImage);

  await validateSchema(record, schema);

  return {
    type: StreamType.Delete,
    record
  };
};

const onBegin = async (request: Partial<Database.Incoming<object>>) => {
  return dispatch(
    {
      type: ServiceEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const onReady = async (request: Partial<Database.Incoming<object>>) => {
  return dispatch(
    {
      type: ServiceEventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const onError = async (error: Error, request: Partial<Database.Incoming<object>>) => {
  console.error(error);

  return dispatch(
    {
      type: ServiceEventType.Error,
      request,
      error
    },
    __EZ4_CONTEXT
  );
};

const onEnd = async (request: Partial<Database.Incoming<object>>) => {
  return dispatch(
    {
      type: ServiceEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
