import type { Service } from '@ez4/common';
import type { Bucket } from '@ez4/storage';

export declare class TestStorage extends Bucket.Service {
  events: [
    Bucket.UseEvent<{
      path: 'uploads/';
      handler: typeof handler;
    }>
  ];
}

export async function handler(_event: Bucket.ObjectEvent, {}: Service.Context<TestStorage>) {}
