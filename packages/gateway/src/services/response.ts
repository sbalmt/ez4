import type { Http } from './http.js';

export interface SuccessResponse extends Http.Response {
  status: 204;
}
