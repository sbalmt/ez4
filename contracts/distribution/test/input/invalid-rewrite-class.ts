import type { Cdn } from '@ez4/distribution';

export declare class TestCdn extends Cdn.Service {
  defaultOrigin: Cdn.UseDefaultOrigin<{
    domain: 'example.com';
    rewrite: [TestRewriteRule];
  }>;
}

// Concrete class is not allowed.
class TestRewriteRule implements Cdn.RewriteRule {
  from!: '/old/*';
  to!: '/new/*';
}
