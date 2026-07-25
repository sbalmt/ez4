import type { Cdn } from '@ez4/distribution';

export declare class TestCdn extends Cdn.Service {
  // @ts-expect-error Invalid redirect status.
  defaultOrigin: Cdn.UseDefaultOrigin<{
    domain: 'example.com';
    rewrite: [
      {
        from: '/old/*';
        to: '/new/*';
        status: 308;
      }
    ];
  }>;
}
