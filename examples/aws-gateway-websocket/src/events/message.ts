import type { Object } from '@ez4/schema';
import type { Ws } from '@ez4/gateway';
import type { AllEvents, Identity } from '../types';

/**
 * Message request example.
 */
declare class MessageRequest implements Ws.Request {
  identity: Identity;
  body: AllEvents;
}

/**
 * Message response example.
 */
declare class MessageResponse implements Ws.Response {
  body: {
    echo: Object.Any;
  };
}

/**
 * Handler for `message` requests.
 * @param request Incoming request.
 * @returns Outgoing response.
 */
export function messageHandler(request: Ws.Incoming<MessageRequest>): MessageResponse {
  return {
    body: {
      echo: request.body
    }
  };
}
