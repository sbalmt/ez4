import type { MessageSchema } from '@ez4/aws-queue/runtime';
import type { SQSEvent, Context } from 'aws-lambda';
import type { Queue } from '@ez4/queue';

import { getJsonMessage } from '@ez4/aws-queue/runtime';

declare function handle(request: Queue.Incoming<any>, context: object): Promise<any>;

declare const __EZ4_SCHEMA: MessageSchema | null;
declare const __EZ4_CONTEXT: object;

/**
 * Entrypoint to handle SQS events.
 */
export async function sqsEntryPoint(event: SQSEvent, context: Context): Promise<void> {
  if (!__EZ4_SCHEMA) {
    throw new Error(`Validation schema for SQS message not found.`);
  }

  for (const record of event.Records) {
    const body = JSON.parse(record.body);
    const message = await getJsonMessage(body, __EZ4_SCHEMA);

    const request = {
      requestId: context.awsRequestId,
      message
    };

    await handle(request, __EZ4_CONTEXT);
  }
}
