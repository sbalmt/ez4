import type { Service } from '@ez4/common';
import type { Ws } from '@ez4/gateway';
import type { Identity } from '../authorizers/types';
import type { AllRequests } from '../types/requests';
import { MessageType, type EchoMessage } from '../types/messages';
import type { WsApi } from '../ws';

import { RequestType } from '../types/requests';

/**
 * Message request example.
 */
declare class MessageRequest implements Ws.Request {
  identity: Identity;
  body: AllRequests;
}

/**
 * Message response example.
 */
declare class MessageResponse implements Ws.Response {
  body?: EchoMessage;
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
    case RequestType.Close: {
      await selfClient.disconnect(connectionId);

      return {
        body: undefined
      };
    }

    case RequestType.Echo: {
      return {
        body: {
          type: MessageType.Echo,
          value: body.value
        }
      };
    }
  }
}
