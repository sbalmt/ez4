import type { Cdn } from '@ez4/distribution';

export declare class TestCdn extends Cdn.Service {
  defaultOrigin: Cdn.UseDefaultOrigin<{
    domain: 'example.com';
    rewrite: [
      Cdn.UseRewriteRule<{
        from: '/old/*';
        to: '/new/*';

        // No extra property is allowed.
        invalid_property: true;
      }>
    ];
  }>;
}
