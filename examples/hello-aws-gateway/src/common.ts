import { Http } from '@ez4/gateway';

/**
 * Catch all errors.
 */
export function catchErrors(error: Error, request: Http.Incoming<Http.Request>) {
  console.error('ERROR', error.message, JSON.stringify(request));
}
