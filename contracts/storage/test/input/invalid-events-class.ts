import type { Bucket } from '@ez4/storage';
import type { Service } from '@ez4/common';

// Concrete class is not allowed.
class TestEvent implements Bucket.Event {
  path!: '*';
  handler!: typeof eventHandler;
}

export declare class TestStorage extends Bucket.Service {
  events: [TestEvent];
}

export function eventHandler(_event: Bucket.ObjectEvent, _context: Service.Context<TestStorage>) {}
