import type { Ws } from '@ez4/gateway';
import type { AllEvents } from '../types';

/**
 * Handler for `data` requests.
 * @param _request Incoming request.
 * @returns Outgoing response.
 */
export function actionsHandler(_request: Ws.Incoming<AllEvents>) {}
