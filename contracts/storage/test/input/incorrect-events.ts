import type { Bucket } from '@ez4/storage';
import type { Service } from '@ez4/common';

// Missing Bucket.Event inheritance.
declare class TestEvent {
  path: '*';
  handler: typeof eventHandler;
}

export declare class TestStorage extends Bucket.Service {
  events: [TestEvent];
}

export async function eventHandler(_event: Bucket.ObjectEvent, _context: Service.Context<TestStorage>) {}
