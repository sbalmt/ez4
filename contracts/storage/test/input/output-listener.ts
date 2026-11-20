import type { Bucket } from '@ez4/storage';

export declare class TestStorage extends Bucket.Service {
  events: [
    Bucket.UseEvent<{
      path: '*';
      handler: typeof eventHandler;
      listener: typeof eventListener;
    }>
  ];
}

export function eventListener(_event: Bucket.ServiceEvent) {}

export function eventHandler(_event: Bucket.ObjectEvent) {}
