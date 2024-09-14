import type { Cdn } from '@ez4/distribution';

/**
 * Test distribution.
 */
export declare class TestCdn extends Cdn.Service {
  disabled: true;

  compress: true;
}
