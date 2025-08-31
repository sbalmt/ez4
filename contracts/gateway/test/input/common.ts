import type { Http } from '@ez4/gateway';

export interface SuccessResponse extends Http.Response {
  status: 204;
}

export interface SuccessAuthResponse extends Http.AuthResponse {
  status: 200;
}
