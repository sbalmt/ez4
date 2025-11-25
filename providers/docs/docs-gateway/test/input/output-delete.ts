import type { Http } from '@ez4/gateway';

export declare class TestApi extends Http.Service {
  name: 'Test API';

  routes: [
    {
      path: 'DELETE /route';
      handler: typeof testHandler;
    }
  ];
}

/**
 * Test the DELETE route documentation.
 */
function testHandler(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
