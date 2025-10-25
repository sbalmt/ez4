import type { Http } from '@ez4/gateway';

export interface SuccessAuthResponse extends Http.AuthResponse {
  identity: {};
}
