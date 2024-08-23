import type { HttpAuthResponse } from './response.js';
import type { HttpAuthRequest } from './request.js';

export type HttpAuthorizer = {
  name: string;
  file: string;
  description?: string;
  response?: HttpAuthResponse;
  request?: HttpAuthRequest;
};
