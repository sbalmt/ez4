import type { Cdn } from '@ez4/distribution';

/**
 * Legacy map and new rule-array formats coexisting in the same service.
 */
export declare class MixedCdn extends Cdn.Service {
  defaultOrigin: Cdn.UseDefaultOrigin<{
    domain: 'example.com';
    rewrite: {
      '/legacy/*': '/internal/*';
      '/exact': '/exact-target';
    };
  }>;

  origins: [
    Cdn.UseOrigin<{
      domain: 'mixed.com';
      path: 'app/*';
      rewrite: [
        {
          from: '/internal/*';
          to: '/modern/*';
        },
        {
          from: '/redirect/*';
          to: 'https://docs.example.com/*';
          status: 301;
        },
        {
          from: '/temporary/*';
          to: '/temp/*';
          status: 302;
        }
      ];
    }>
  ];
}
