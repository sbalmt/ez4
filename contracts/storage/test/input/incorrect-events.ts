import type { Bucket } from '@ez4/storage';
import type { Service } from '@ez4/common';

// Missing Bucket.Event inheritance.
declare class TestEvent {
  handler: typeof eventHandler;
}

export declare class TestStorage extends Bucket.Service {
  events: TestEvent;
}

export async function eventHandler(_event: Bucket.Event, _context: Service.Context<TestStorage>) {}
