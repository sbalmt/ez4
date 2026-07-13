import type { SQSClient } from '@aws-sdk/client-sqs';
import type { AnyObject } from '@ez4/utils';

import { DeleteMessageCommand, ReceiveMessageCommand } from '@aws-sdk/client-sqs';
import { Logger } from '@ez4/logger';

export type QueuePollerOptions = {
  key: string;
  client: SQSClient;
  queueUrl: string;
  waitTime: number;
  maxMessages: number;
  dispatch: (message: AnyObject, traceId?: string) => Promise<void>;
};

export type QueuePoller = {
  once: () => Promise<void>;
  start: () => void;
  stop: () => boolean;
};

const activePollers = new Map<string, QueuePoller>();

export const createQueuePoller = (options: QueuePollerOptions): QueuePoller => {
  let isRunning = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const poll = async () => {
    if (!isRunning) {
      return;
    }

    await pollOnce(options);

    if (isRunning) {
      timeoutId = setTimeout(poll, options.waitTime * 1000);
    }
  };

  const poller: QueuePoller = {
    once: () => pollOnce(options),
    start: () => {
      if (isRunning) {
        return;
      }

      isRunning = true;

      activePollers.set(options.key, poller);

      poll();
    },
    stop: () => {
      isRunning = false;

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }

      return activePollers.delete(options.key);
    }
  };

  return poller;
};

export const stopQueuePoller = (key: string): boolean => {
  const poller = activePollers.get(key);

  if (poller) {
    return poller.stop();
  }

  return false;
};

const pollOnce = async (options: QueuePollerOptions) => {
  const { client, queueUrl, waitTime, maxMessages, dispatch } = options;

  try {
    const response = await client.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: maxMessages,
        WaitTimeSeconds: waitTime,
        MessageAttributeNames: ['All']
      })
    );

    const messages = response.Messages;

    if (!messages || messages.length === 0) {
      return;
    }

    for (const message of messages) {
      try {
        const traceId = message.MessageAttributes?.['EZ4.TRACE_ID']?.StringValue;

        await dispatch(JSON.parse(message.Body!), traceId);

        await client.send(
          new DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: message.ReceiptHandle
          })
        );
      } catch (error) {
        Logger.warn(`Failed to process message from queue [${options.key}].`);
        Logger.warn(`    ${error}`);
      }
    }
  } catch (error) {
    Logger.warn(`Failed to poll queue [${options.key}].`);
    Logger.warn(`    ${error}`);
  }
};
