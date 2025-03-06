import type { Http } from '@ez4/gateway';
import type { SuccessResponse } from './common.js';

/**
 * Service for testing route listener.
 */
export declare class TestService extends Http.Service {
  routes: [
    {
      path: 'ANY /test-route';
      listener: typeof testListener;
      handler: typeof testHandler;
    }
  ];
}

export function testListener(): void {}

export function testHandler(): SuccessResponse {
  return {
    status: 204
  };
}
