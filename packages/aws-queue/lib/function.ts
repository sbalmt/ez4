import type { SQSEvent, Context } from 'aws-lambda';
import type { ObjectSchema } from '@ez4/schema';

import { getJsonMessage } from '@ez4/aws-queue/runtime';

declare function next(message: unknown, context: object): Promise<any>;

declare const __EZ4_SCHEMA: ObjectSchema | null;
declare const __EZ4_CONTEXT: object;

/**
 * Entrypoint to handle SQS events.
 */
export async function sqsEntryPoint(event: SQSEvent, context: Context): Promise<void> {
  for (const record of event.Records) {
    const rawMessage = JSON.parse(record.body);

    if (!__EZ4_SCHEMA) {
      throw new Error(`Validation schema for message is not defined.`);
    }

    const message = await getJsonMessage(rawMessage, __EZ4_SCHEMA);

    await next(message, __EZ4_CONTEXT);
  }
}
