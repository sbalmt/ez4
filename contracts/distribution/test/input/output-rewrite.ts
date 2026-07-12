import type { Cdn } from '@ez4/distribution';

declare class TestRewriteRule implements Cdn.RewriteRule {
  status: 301;
  from: '/old/*';
  to: '/new/*';
}

export declare class TestCdn extends Cdn.Service {
  defaultOrigin: Cdn.UseDefaultOrigin<{
    domain: 'example.com';
    rewrite: [
      TestRewriteRule,

      Cdn.UseRewriteRule<{
        from: '/legacy/*';
        to: '/internal/*';
      }>,

      {
        from: '/exact';
        to: '/exact-target';
      }
    ];
  }>;

  origins: [
    Cdn.UseOrigin<{
      domain: 'mixed.com';
      path: 'app/*';
      rewrite: [
        TestRewriteRule,

        Cdn.UseRewriteRule<{
          from: '/internal/*';
          to: '/modern/*';
        }>,

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
