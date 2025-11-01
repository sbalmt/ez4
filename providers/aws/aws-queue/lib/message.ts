import type { SQSEvent, Context, SQSBatchItemFailure, SQSBatchResponse, SQSRecord } from 'aws-lambda';
import type { MessageSchema } from '@ez4/queue/utils';
import type { Queue } from '@ez4/queue';

import * as QueueUtils from '@ez4/queue/utils';

import { SQSClient, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { ServiceEventType } from '@ez4/common';

const client = new SQSClient({});

declare const __EZ4_SCHEMA: MessageSchema | null;
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
    requestId: context.awsRequestId
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
      const message = await QueueUtils.getJsonMessage(payload, schema);

      currentRequest = {
        ...request,
        message
      };

      await onReady(currentRequest);

      await handle(currentRequest, __EZ4_CONTEXT);
      await ackMessage(record);

      await onDone(currentRequest);
      //
    } catch (error) {
      await onError(error, currentRequest ?? request);

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

const onBegin = async (request: Queue.Request) => {
  return dispatch(
    {
      type: ServiceEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const onReady = async (request: Queue.Incoming<Queue.Message>) => {
  return dispatch(
    {
      type: ServiceEventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const onDone = async (request: Queue.Incoming<Queue.Message>) => {
  return dispatch(
    {
      type: ServiceEventType.Done,
      request
    },
    __EZ4_CONTEXT
  );
};

const onError = async (error: unknown, request: Queue.Request | Queue.Incoming<Queue.Message>) => {
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

const onEnd = async (request: Queue.Request) => {
  return dispatch(
    {
      type: ServiceEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
