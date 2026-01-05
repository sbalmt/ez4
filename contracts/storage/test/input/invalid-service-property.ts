import type { Bucket } from '@ez4/storage';

export declare class TestStorage extends Bucket.Service {
  // No extra property is allowed.
  invalid_property: true;
}
