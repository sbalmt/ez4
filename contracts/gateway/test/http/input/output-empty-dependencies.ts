import type { Http } from '@ez4/gateway';
import type { Service } from '@ez4/common';

export declare class TestService extends Http.Service {
  services: {};

  routes: [
    Http.UseRoute<{
      path: 'GET /empty';
      handler: typeof handler;
    }>
  ];
}

function handler(_request: Http.Incoming<Http.EmptyRequest>, {}: Service.Context<TestService>): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
