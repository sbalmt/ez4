import type { Bucket } from '@ez4/storage';

export declare class TestStorage extends Bucket.Service {
  tags: Bucket.UseTags<{
    FOO: 'foo';
    BAR: 'bar';
  }>;
}
