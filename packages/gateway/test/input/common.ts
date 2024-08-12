import type { Http } from '@ez4/gateway';

export interface SuccessResponse extends Http.Response {
  status: 204;
}
