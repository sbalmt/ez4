import type { SNSEvent, Context } from 'aws-lambda';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';

import { getJsonMessage } from '@ez4/aws-queue/runtime';

declare function next(message: unknown, context: object): Promise<any>;

declare const __EZ4_SCHEMA: ObjectSchema | UnionSchema | null;
declare const __EZ4_CONTEXT: object;

/**
 * Entrypoint to handle SNS events.
 */
export async function snsEntryPoint(event: SNSEvent, context: Context): Promise<void> {
  if (!__EZ4_SCHEMA) {
    throw new Error(`Validation schema for SNS message not found.`);
  }

  for (const record of event.Records) {
    const body = JSON.parse(record.Sns.Message);
    const message = await getJsonMessage(body, __EZ4_SCHEMA);

    const request = {
      requestId: context.awsRequestId,
      message
    };

    await next(request, __EZ4_CONTEXT);
  }
}
