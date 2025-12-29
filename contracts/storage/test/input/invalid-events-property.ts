import type { Bucket } from '@ez4/storage';
import type { Service } from '@ez4/common';

export declare class TestStorage extends Bucket.Service {
  events: Bucket.UseEvents<{
    handler: typeof eventHandler;

    // No extra property is allowed
    invalid_property: true;
  }>;
}

export function eventHandler(_event: Bucket.Event, _context: Service.Context<TestStorage>) {}
