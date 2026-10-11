import type { WsService } from '@ez4/gateway/library';
import type { AnyObject } from '@ez4/utils';
import type { ProviderConnectionEvent } from '../../types/events';

import type {
  EmulateServiceContext,
  EmulatorConnectionEvent,
  EmulatorMessageEvent,
  EmulatorConnection,
  ServeOptions,
  ServiceEmulator
} from '@ez4/project/library';

import { registerProvider, unregisterProvider } from '@ez4/emulator';
import { getServiceName } from '@ez4/project/library';
import { Logger } from '@ez4/logger';

import { createLocalConnections } from '../../client/ws/service';
import { processWsAuthorization } from '../../handlers/ws/authorizer';
import { processWsConnection } from '../../handlers/ws/connection';
import { processWsMessage } from '../../handlers/ws/message';
import { ProviderEvent } from '../../types/events';

export const registerWsLocalService = (service: WsService, options: ServeOptions, context: EmulateServiceContext): ServiceEmulator => {
  const { name: resourceName, defaults, connect, message } = service;

  const allConnections: Record<string, EmulatorConnection> = {};
  const identities: Record<string, AnyObject> = {};

  const localConnections = createLocalConnections(allConnections);

  const identifier = getServiceName(resourceName, options);
  const provider = `gateway:${identifier}`;

  const clientOptions = {
    messageSchema: service.schema,
    preferences: message.preferences ?? defaults?.preferences
  };

  return {
    type: 'Gateway',
    name: resourceName,
    options: service.options,
    identifier,
    bootstrapHandler: () => {
      registerProvider(provider, {
        eventTypes: [ProviderEvent.SendMessage, ProviderEvent.Disconnect],
        eventHandler: (event: string, payload: ProviderConnectionEvent | undefined) => {
          if (!payload) {
            throw new Error('Missing connection event payload.');
          }

          const { connectionId } = payload;

          if (event === ProviderEvent.Disconnect) {
            return localConnections.disconnect(connectionId);
          }

          if (!payload.payload) {
            throw new Error('Missing connection message payload.');
          }

          try {
            localConnections.sendMessage(connectionId, payload.payload);
          } catch (error) {
            Logger.warn(`Unable to send message to connection [${resourceName}]: ${error}`);
          }
        }
      });
    },
    shutdownHandler: () => {
      unregisterProvider(provider);
    },
    exportDescriptor: () => {
      return {
        name: 'makeWsService',
        module: '@ez4/local-gateway/worker',
        provider,
        options: {
          ...clientOptions,
          name: resourceName
        }
      };
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

      const identity = identities[connection.id];

      return processWsMessage(service, options, context, message, identity);
    }
  };
};
