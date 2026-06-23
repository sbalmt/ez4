import type { Cdn } from '@ez4/distribution';

/**
 * Legacy rewrite map on no-path default origin.
 */
export declare class LegacyCdn extends Cdn.Service {
  defaultOrigin: Cdn.UseDefaultOrigin<{
    domain: 'example.com';
    rewrite: {
      '/old/*': '/new/*';
      '/exact-path': '/exact-target';
    };
  }>;

  origins: [
    Cdn.UseOrigin<{
      domain: 'legacy-class.com';
      path: 'api/*';
      rewrite: {
        '/v1/*': '/index.html';
        '/v2/*': '/app.html';
      };
    }>,
    Cdn.UseOrigin<{
      domain: 'mixed.com';
      path: 'static/*';
      rewrite: {
        '/images/*': '/assets/img/*';
        '/css/*': '/assets/css/*';
      };
    }>
  ];
}
