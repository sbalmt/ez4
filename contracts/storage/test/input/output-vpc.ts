import type { Bucket } from '@ez4/storage';

export declare class TestStorage extends Bucket.Service {
  events: Bucket.UseEvents<{
    path: 'uploads/*';
    handler: typeof eventHandler;
    vpc: true;
  }>;
}

export async function eventHandler(_event: Bucket.Event) {}
