import type { Environment, Service } from '@ez4/common';
import type { Bucket } from '@ez4/storage';

export declare class TestStorage extends Bucket.Service {
  events: Bucket.UseEvents<{
    path: 'uploads/*';
    handler: typeof eventHandler;
    logRetention: 14;
    memory: 128;
    timeout: 5;
  }>;

  // Services to all streams.
  services: {
    selfClient: Environment.Service<TestStorage>;
  };
}

/**
 * Test storage event.
 */
export async function eventHandler(_event: Bucket.Event, _context: Service.Context<TestStorage>) {}
