import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { Context, ScheduledEvent } from 'aws-lambda';
import type { Cron } from '@ez4/scheduler';

import { getJsonEvent } from '@ez4/aws-scheduler/runtime';

declare function handle(request: Cron.Incoming<any>, context: object): Promise<void>;
declare function handle(context: object): Promise<void>;

declare const __EZ4_CONTEXT: object;
declare const __EZ4_SCHEMA: ObjectSchema | UnionSchema | null;

/**
 * Entrypoint to handle EventBridge scheduler events.
 */
export async function eventEntryPoint(event: ScheduledEvent, context: Context): Promise<void> {
  if (!__EZ4_SCHEMA) {
    await handle(__EZ4_CONTEXT);
    return;
  }

  const safeEvent = await getJsonEvent(event, __EZ4_SCHEMA);

  const request = {
    requestId: context.awsRequestId,
    event: safeEvent
  };

  await handle(request, __EZ4_CONTEXT);
}
