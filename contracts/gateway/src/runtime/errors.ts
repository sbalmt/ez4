/**
 * HTTP client request timeout error.
 */
export class HttpRequestTimeoutError extends Error {
  constructor() {
    super('Request timed out');
  }
}
