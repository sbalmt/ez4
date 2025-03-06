import type { Bucket } from '@ez4/storage';

export declare class TestStorage extends Bucket.Service {
  events: {
    listener: typeof eventListener;
    handler: typeof eventHandler;
  };
}

export function eventListener(_event: Bucket.ServiceEvent) {}

export function eventHandler(_event: Bucket.Event) {}
