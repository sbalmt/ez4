import type { Bucket } from '@ez4/storage';

export declare class TestStorage extends Bucket.Service {
  events: [
    Bucket.UseEvent<{
      path: 'uploads/';
      handler: typeof eventHandler;
      vpc: true;
    }>,
    Bucket.UseEvent<{
      path: 'others/';
      handler: typeof eventHandler;
      vpc: false;
    }>
  ];
}

export async function eventHandler(_event: Bucket.ObjectEvent) {}
