import type { Context, EventBridgeEvent } from 'aws-lambda';

type RequestEvent = EventBridgeEvent<string, void>;

declare function next(context: object): Promise<void>;

declare const __EZ4_CONTEXT: object;

/**
 * Entrypoint to handle EventBridge events.
 */
export async function eventEntryPoint(event: RequestEvent, context: Context): Promise<void> {
  await next(__EZ4_CONTEXT);
}
