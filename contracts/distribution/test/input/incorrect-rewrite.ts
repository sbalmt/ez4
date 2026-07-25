import type { Cdn } from '@ez4/distribution';

export declare class TestCdn extends Cdn.Service {
  defaultOrigin: Cdn.UseDefaultOrigin<{
    domain: 'example.com';
    rewrite: [TestRewriteRule];
  }>;
}

// Missing Cdn.RewriteRule inheritance.
declare class TestRewriteRule {
  from: '/old/*';
  to: '/new/*';
}
