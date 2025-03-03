import type { Http } from '@ez4/gateway';
import type { SuccessResponse } from './common.js';

/**
 * Service for testing route catcher.
 */
export declare class TestService extends Http.Service {
  routes: [
    {
      path: 'ANY /test-route';
      catcher: typeof testCatcher;
      handler: typeof testHandler;
    }
  ];
}

export function testCatcher(): void {}

export function testHandler(): SuccessResponse {
  return {
    status: 204
  };
}
