import type { Cache } from '@ez4/cache';

export declare class TestCache extends Cache.Service {
  engine: {
    name: 'test';
  };

  // No extra property is allowed.
  invalid_property: true;
}
