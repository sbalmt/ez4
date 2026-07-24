import type { SQSEvent, Context, SQSBatchItemFailure, SQSBatchResponse, SQSRecord } from 'aws-lambda';
import type { ValidationCustomContext } from '@ez4/validator';
import type { MessageSchema } from '@ez4/queue/utils';
import type { Queue } from '@ez4/queue';

import { getJsonMessage, resolveValidation } from '@ez4/queue/utils';
import { SQSClient, DeleteMessageCommand, ChangeMessageVisibilityCommand } from '@aws-sdk/client-sqs';
import { ServiceEventType, Runtime } from '@ez4/common';
import { getRandomUUID, Wait } from '@ez4/utils';

const client = new SQSClient({});

declare const __EZ4_SCHEMA: MessageSchema | null;
declare const __EZ4_MAX_ATTEMPTS: number;
declare const __EZ4_MIN_BACKOFF: number;
declare const __EZ4_MAX_BACKOFF: number;
declare const __EZ4_CONTEXT: object;

declare function dispatch(event: Queue.ServiceEvent<Queue.Message>, context: object): Promise<void>;
declare function handle(request: Queue.Incoming<Queue.Message>, context: object): Promise<any>;

/**
 * Entrypoint to handle SQS events.
 */
export async function sqsEntryPoint(event: SQSEvent, context: Context): Promise<SQSBatchResponse | void> {
  if (!__EZ4_SCHEMA) {
    throw new Error('Validation schema for SQS message not found.');
  }

  const request = {
    requestId: context.awsRequestId,
    maxAttempts: __EZ4_MAX_ATTEMPTS,
    attempt: Number.NaN
  };

  try {
    await onBegin(request);

    const batchItemFailures = await processAllRecords(request, __EZ4_SCHEMA, event.Records);

    return {
      batchItemFailures
    };
  } catch (error) {
    await onError(error, request);
  } finally {
    await onEnd(request);
  }
}

const processAllRecords = async (request: Queue.Request, schema: MessageSchema, records: SQSRecord[]) => {
  const failedMessages: SQSBatchItemFailure[] = [];
  const failedGroupIds = new Set<string>();

  let currentRequest: Queue.Incoming<Queue.Message> | undefined;

  for (const record of records) {
    const messageGroupId = record.attributes.MessageGroupId;
    const messageId = record.messageId;

    try {
      // If a previous message from the same message group (FIFO Queues) has failed,
      // skip all the next messages in that group to avoid duplication.
      if (messageGroupId && failedGroupIds.has(messageGroupId)) {
        failedMessages.push({ itemIdentifier: messageId });
        continue;
      }

      const payload = JSON.parse(record.body);
      const message = await getJsonMessage(payload, schema, onCustomValidation);

      const traceId = record.messageAttributes['EZ4.TRACE_ID']?.stringValue ?? getRandomUUID();

      currentRequest = {
        ...request,
        attempt: Number(record.attributes.ApproximateReceiveCount),
        traceId,
        message
      };

      Runtime.setScope({
        traceId
      });

      await onReady(currentRequest);

      await handle(currentRequest, __EZ4_CONTEXT);
      await ackMessage(record);

      await onDone(currentRequest);
      //
    } catch (error) {
      await onError(error, currentRequest ?? request);
      await retryMessage(record);

      failedMessages.push({ itemIdentifier: messageId });

      if (messageGroupId) {
        failedGroupIds.add(messageGroupId);
      }
    }
  }

  return failedMessages;
};

const getQueueUrl = (queueArn: string): string => {
  const arnParts = queueArn.match(/^arn:aws:sqs:([^:]+):([^:]+):(.+)$/);

  if (!arnParts) {
    throw new Error('Invalid event source ARN.');
  }

  const [, region, accountId, queueName] = arnParts;

  return `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`;
};

const ackMessage = async (record: SQSRecord) => {
  const { messageId, receiptHandle } = record;

  try {
    await client.send(
      new DeleteMessageCommand({
        QueueUrl: getQueueUrl(record.eventSourceARN),
        ReceiptHandle: receiptHandle
      })
    );
  } catch (error) {
    console.warn({
      error: `${error}`,
      receiptHandle,
      messageId
    });
  }
};

const retryMessage = async (record: SQSRecord) => {
  const { messageId, receiptHandle, attributes } = record;

  try {
    const attemptCount = Number(attributes.ApproximateReceiveCount);
    const attemptDelay = Wait.delay(attemptCount, __EZ4_MAX_ATTEMPTS, __EZ4_MIN_BACKOFF, __EZ4_MAX_BACKOFF);

    await client.send(
      new ChangeMessageVisibilityCommand({
        QueueUrl: getQueueUrl(record.eventSourceARN),
        VisibilityTimeout: attemptDelay,
        ReceiptHandle: receiptHandle
      })
    );
  } catch (error) {
    console.warn({
      error: `${error}`,
      receiptHandle,
      messageId
    });
  }
};

const onCustomValidation = (value: unknown, context: ValidationCustomContext) => {
  return resolveValidation(value, __EZ4_CONTEXT, context.type);
};

const onBegin = (request: Partial<Queue.Request>) => {
  return dispatch(
    {
      type: ServiceEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const onReady = (request: Partial<Queue.Incoming<Queue.Message>>) => {
  return dispatch(
    {
      type: ServiceEventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const onDone = async (request: Partial<Queue.Incoming<Queue.Message>>) => {
  return dispatch(
    {
      type: ServiceEventType.Done,
      request
    },
    __EZ4_CONTEXT
  );
};

const onError = (error: unknown, request: Partial<Queue.Request | Queue.Incoming<Queue.Message>>) => {
  console.error({ ...Runtime.getScope(), error });

  return dispatch(
    {
      type: ServiceEventType.Error,
      request,
      error
    },
    __EZ4_CONTEXT
  );
};

const onEnd = (request: Partial<Queue.Request>) => {
  return dispatch(
    {
      type: ServiceEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
