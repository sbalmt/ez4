import type { Service } from '@ez4/common';
import type { Ws } from '@ez4/gateway';
import type { Identity } from '../authorizers/types';
import type { AllEvents } from '../types';

import { EventType } from '../types';
import { WsApi } from '../ws';

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
  body?: {
    echo: string;
  };
}

/**
 * Handler for `message` requests.
 * @param request Incoming request.
 * @returns Outgoing response.
 */
export async function messageHandler(request: Ws.Incoming<MessageRequest>, context: Service.Context<WsApi>): Promise<MessageResponse> {
  const { connectionId, body } = request;
  const { selfClient } = context;

  switch (body.type) {
    case EventType.Close: {
      await selfClient.disconnect(connectionId);

      return {
        body: undefined
      };
    }

    case EventType.Echo: {
      return {
        body: {
          echo: body.value
        }
      };
    }
  }
}
