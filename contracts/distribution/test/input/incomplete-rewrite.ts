import type { Cdn } from '@ez4/distribution';

export declare class TestCdn extends Cdn.Service {
  // @ts-expect-error Missing required target.
  defaultOrigin: Cdn.UseDefaultOrigin<{
    domain: 'example.com';
    rewrite: [
      {
        from: '/old/*';
      }
    ];
  }>;
}
