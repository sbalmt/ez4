import type { WsService } from '@ez4/gateway/library';
import type { AnyObject } from '@ez4/utils';

import type {
  EmulateServiceContext,
  EmulatorConnectionEvent,
  EmulatorMessageEvent,
  EmulatorConnection,
  ServeOptions
} from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { HttpError } from '@ez4/gateway';

import { createWsServiceClient } from '../../client/ws/service';
import { processWsAuthorization } from '../../handlers/ws/authorizer';
import { processWsConnection } from '../../handlers/ws/connection';
import { processWsMessage } from '../../handlers/ws/message';
import { getWsErrorResponse } from '../../utils/ws/response';

export const registerWsLocalServices = (service: WsService, options: ServeOptions, context: EmulateServiceContext) => {
  const { name: resourceName, defaults, connect, message } = service;

  const allConnections: Record<string, EmulatorConnection> = {};
  const identities: Record<string, AnyObject> = {};

  const clientOptions = {
    messageSchema: service.schema,
    preferences: message.preferences ?? defaults?.preferences,
    allConnections
  };

  return {
    type: 'Gateway',
    name: resourceName,
    identifier: getServiceName(resourceName, options),
    exportHandler: () => {
      return createWsServiceClient(resourceName, clientOptions);
    },
    connectHandler: async (event: EmulatorConnectionEvent) => {
      const { connection } = event;

      if (!connect.authorizer) {
        await processWsConnection(service, options, context, event);
      } else {
        const identity = await processWsAuthorization(service, options, context, event);

        if (identity) {
          await processWsConnection(service, options, context, event, identity);
          identities[connection.id] = identity;
        }
      }

      allConnections[connection.id] = connection;
    },
    disconnectHandler: async (event: EmulatorConnectionEvent) => {
      const { connection } = event;

      const identity = identities[connection.id];

      delete allConnections[connection.id];

      return processWsConnection(service, options, context, event, identity);
    },
    messageHandler: async (message: EmulatorMessageEvent) => {
      const { connection } = message;

      try {
        const identity = identities[connection.id];

        return await processWsMessage(service, options, context, message, identity);
        //
      } catch (error) {
        if (error instanceof HttpError) {
          return getWsErrorResponse(error);
        }

        throw error;
      }
    }
  };
};
