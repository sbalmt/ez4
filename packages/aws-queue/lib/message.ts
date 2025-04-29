import type { SQSEvent, Context, SQSBatchItemFailure, SQSBatchResponse, SQSRecord } from 'aws-lambda';
import type { MessageSchema } from '@ez4/aws-queue/runtime';
import type { Service } from '@ez4/common';
import type { Queue } from '@ez4/queue';

import { getJsonMessage } from '@ez4/aws-queue/runtime';
import { ServiceEventType } from '@ez4/common';

declare const __EZ4_SCHEMA: MessageSchema | null;
declare const __EZ4_CONTEXT: object;

declare function handle(request: Queue.Incoming<Queue.Message>, context: object): Promise<any>;
declare function dispatch(event: Service.Event<Queue.Incoming<Queue.Message>>, context: object): Promise<void>;

/**
 * Entrypoint to handle SQS events.
 */
export async function sqsEntryPoint(event: SQSEvent, context: Context): Promise<SQSBatchResponse | void> {
  const request = {
    requestId: context.awsRequestId
  };

  try {
    await onBegin(request);

    if (!__EZ4_SCHEMA) {
      throw new Error(`Validation schema for SQS message not found.`);
    }

    const allFailures = await processAllRecords(request, __EZ4_SCHEMA, event.Records);

    return {
      batchItemFailures: allFailures
    };
  } catch (error) {
    await onError(error, request);
  } finally {
    await onEnd(request);
  }
}

const processAllRecords = async (
  request: Pick<Queue.Incoming<Queue.Message>, 'requestId'>,
  schema: MessageSchema,
  records: SQSRecord[]
) => {
  const allFailures: SQSBatchItemFailure[] = [];

  let lastRequest: Queue.Incoming<Queue.Message> | undefined;

  for (const record of records) {
    try {
      const body = JSON.parse(record.body);
      const message = await getJsonMessage(body, schema);

      lastRequest = {
        ...request,
        message
      };

      await onReady(lastRequest);

      await handle(lastRequest, __EZ4_CONTEXT);
    } catch (error) {
      await onError(error, lastRequest ?? request);

      allFailures.push({
        itemIdentifier: record.messageId
      });
    }
  }

  return allFailures;
};

const onBegin = async (request: Partial<Queue.Incoming<Queue.Message>>) => {
  return dispatch(
    {
      type: ServiceEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const onReady = async (request: Partial<Queue.Incoming<Queue.Message>>) => {
  return dispatch(
    {
      type: ServiceEventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const onError = async (error: Error, request: Partial<Queue.Incoming<Queue.Message>>) => {
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

const onEnd = async (request: Partial<Queue.Incoming<Queue.Message>>) => {
  return dispatch(
    {
      type: ServiceEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
