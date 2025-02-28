import type { Bucket, BucketEvent } from '@ez4/storage';
import type { Service } from '@ez4/common';

// Concrete class is not allowed.
class TestEvent implements Bucket.Event {
  handler!: typeof eventHandler;
}

export declare class TestStorage extends Bucket.Service {
  events: TestEvent;
}

export async function eventHandler(_change: BucketEvent, _context: Service.Context<TestStorage>) {}
