import type { NamingStyle } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  name: 'Remote API';

  routes: [
    Http.UseRoute<{
      path: 'ANY /test-route';
      listener: typeof testListener;
      handler: typeof testHandler;
    }>
  ];

  defaults: Http.UseDefaults<{
    preferences: {
      namingStyle: NamingStyle.Preserve;
    };
  }>;
}

function testListener(): void {}

function testHandler(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}

/**
 * Import API gateway.
 */
export declare class TestImport extends Http.Import<TestService> {
  project: 'name from project in ez4.project.js';
}
