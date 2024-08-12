import type { HttpRequest } from './request.js';
import type { HttpResponse } from './response.js';

export type HttpHandler = {
  name: string;
  file: string;
  description?: string;
  response: HttpResponse;
  request?: HttpRequest;
};
