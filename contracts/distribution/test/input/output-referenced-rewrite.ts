import type { Cdn } from '@ez4/distribution';

/**
 * Rewrite rule referenced by name within the new array format.
 */
declare class RedirectRule implements Cdn.RewriteRule {
  from: '/old/*';
  to: '/new/*';
  status: 301;
}

export declare class ReferencedCdn extends Cdn.Service {
  defaultOrigin: Cdn.UseDefaultOrigin<{
    domain: 'example.com';
    rewrite: [
      RedirectRule,
      {
        from: '/inline/*';
        to: '/internal/*';
      }
    ];
  }>;
}
