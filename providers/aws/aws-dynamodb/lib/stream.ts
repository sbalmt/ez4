import type { DynamoDBStreamEvent, Context, DynamoDBRecord } from 'aws-lambda';
import type { Database, StreamDeleteChange, StreamInsertChange, StreamUpdateChange } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { unmarshall } from '@aws-sdk/util-dynamodb';
import { validateSchema } from '@ez4/aws-dynamodb/runtime';
import { createTransformContext, transform } from '@ez4/transform';
import { StreamChangeType } from '@ez4/database';
import { ServiceEventType } from '@ez4/common';

declare const __EZ4_SCHEMA: ObjectSchema | null;
declare const __EZ4_CONTEXT: object;

declare function dispatch(event: Database.ServiceEvent<Database.Schema>, context: object): Promise<void>;
declare function handle(changes: Database.Incoming<Database.Schema>, context: object): Promise<void>;

/**
 * Entrypoint to handle DynamoDB stream events.
 */
export async function dbStreamEntryPoint(event: DynamoDBStreamEvent, context: Context): Promise<void> {
  let currentRequest: Database.Incoming<Database.Schema> | undefined;

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

      currentRequest = {
        ...request,
        ...change
      };

      await onReady(currentRequest);
      await handle(currentRequest, __EZ4_CONTEXT);
      await onDone(currentRequest);
    }
  } catch (error) {
    await onError(error, currentRequest ?? request);
  } finally {
    await onEnd(request);
  }
}

const getRecordChange = async (record: DynamoDBRecord, schema: ObjectSchema) => {
  const { eventName, dynamodb } = record;

  switch (eventName) {
    case 'INSERT': {
      if (dynamodb?.NewImage) {
        return getInsertChange(dynamodb.NewImage, schema);
      }

      break;
    }

    case 'MODIFY': {
      if (dynamodb?.NewImage && dynamodb?.OldImage) {
        return getUpdateChange(dynamodb.NewImage, dynamodb.OldImage, schema);
      }

      break;
    }

    case 'REMOVE': {
      if (dynamodb?.OldImage) {
        return getDeleteChange(dynamodb.OldImage, schema);
      }

      break;
    }
  }

  return null;
};

const getInsertChange = async (newImage: AnyObject, schema: ObjectSchema) => {
  const record = transformRecord(unmarshall(newImage), schema);

  await validateSchema(record, schema);

  return {
    type: StreamChangeType.Insert,
    record
  } satisfies StreamInsertChange<Database.Schema>;
};

const getUpdateChange = async (newImage: AnyObject, oldImage: AnyObject, schema: ObjectSchema) => {
  const newRecord = transformRecord(unmarshall(newImage), schema);
  const oldRecord = transformRecord(unmarshall(oldImage), schema);

  await Promise.all([validateSchema(newRecord, schema), validateSchema(oldRecord, schema)]);

  return {
    type: StreamChangeType.Update,
    newRecord,
    oldRecord
  } satisfies StreamUpdateChange<Database.Schema>;
};

const getDeleteChange = async (oldImage: AnyObject, schema: ObjectSchema) => {
  const record = transformRecord(unmarshall(oldImage), schema);

  await validateSchema(record, schema);

  return {
    type: StreamChangeType.Delete,
    record
  } satisfies StreamDeleteChange<Database.Schema>;
};

const transformRecord = (input: AnyObject, schema: ObjectSchema) => {
  const record = transform(input, schema, createTransformContext({ convert: false }));

  return record as AnyObject;
};

const onBegin = async (request: Database.Request) => {
  return dispatch(
    {
      type: ServiceEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const onReady = async (request: Database.Incoming<Database.Schema>) => {
  return dispatch(
    {
      type: ServiceEventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const onDone = async (request: Database.Incoming<Database.Schema>) => {
  return dispatch(
    {
      type: ServiceEventType.Done,
      request
    },
    __EZ4_CONTEXT
  );
};

const onError = async (error: unknown, request: Database.Request | Database.Incoming<Database.Schema>) => {
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

const onEnd = async (request: Database.Request) => {
  return dispatch(
    {
      type: ServiceEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
