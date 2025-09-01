import type { Http } from '@ez4/gateway';
import type { GeneralResponse } from '../types';

/**
 * Public request example.
 */
declare class PublicRequest implements Http.Request {}

/**
 * Handler for `public` requests.
 * @param _request Incoming request.
 * @returns Outgoing response.
 */
export function publicHandler(_request: PublicRequest): GeneralResponse {
  return {
    status: 200,
    body: {
      message: 'Public request'
    }
  };
}
