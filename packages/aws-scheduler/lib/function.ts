import type { Context, ScheduledEvent } from 'aws-lambda';

declare function next(context: object): Promise<void>;

declare const __EZ4_CONTEXT: object;

/**
 * Entrypoint to handle EventBridge events.
 */
export async function eventEntryPoint(event: ScheduledEvent, context: Context): Promise<void> {
  if (event.detail) {
    console.log('DETAILS', event.detail);
  }

  await next(__EZ4_CONTEXT);
}
