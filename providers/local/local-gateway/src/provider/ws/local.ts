import type { EmulateServiceContext, ServeOptions, ServiceEmulator } from '@ez4/project/library';
import type { WsProviderConnection, WsProviderMessage } from '@ez4/server';
import type { WsService } from '@ez4/gateway/library';
import type { AnyObject } from '@ez4/utils';
import type { ProviderConnectionEvent } from '../../types/events';

import { registerProvider as registerEmulatorProvider, unregisterProvider as unregisterEmulatorProvider } from '@ez4/emulator';
import { ProviderType, registerProvider as registerServerProvider, unregisterProvider as unregisterServerProvider } from '@ez4/server';
import { getServiceName } from '@ez4/project/library';
import { HttpForbiddenError } from '@ez4/gateway';
import { Logger } from '@ez4/logger';

import { createLocalConnections } from '../../client/ws/service';
import { processWsAuthorization } from '../../handlers/ws/authorizer';
import { processWsConnection, WsConnectionType } from '../../handlers/ws/connection';
import { processWsMessage } from '../../handlers/ws/message';
import { ProviderEvent } from '../../types/events';

const MAX_MESSAGE_SIZE = 128 * 1024;

export const registerWsLocalService = (service: WsService, options: ServeOptions, context: EmulateServiceContext): ServiceEmulator => {
  const { name: resourceName, defaults, connect, message } = service;

  const identities: Record<string, AnyObject> = {};

  const localConnections = createLocalConnections();

  const identifier = getServiceName(resourceName, options);
  const provider = `gateway:${identifier}`;

  const clientOptions = {
    messageSchema: service.schema,
    preferences: message.preferences ?? defaults?.preferences
  };

  const connectHandler = async (connection: WsProviderConnection) => {
    if (!connect.authorizer) {
      return processWsConnection(service, options, context, WsConnectionType.Connect, connection);
    }

    const identity = await processWsAuthorization(service, options, context, connection);

    if (!identity) {
      throw new HttpForbiddenError();
    }

    await processWsConnection(service, options, context, WsConnectionType.Connect, connection, identity);

    identities[connection.id] = identity;
  };

  const disconnectHandler = async (connection: WsProviderConnection) => {
    const identity = identities[connection.id];

    delete identities[connection.id];

    return processWsConnection(service, options, context, WsConnectionType.Disconnect, connection, identity);
  };

  const messageHandler = async (message: WsProviderMessage) => {
    const { client, body } = message;

    if (body.length > MAX_MESSAGE_SIZE) {
      Logger.warn(`Message for connection [${resourceName}] exceeds ${MAX_MESSAGE_SIZE} bytes, closing connection.`);

      await client.close();
      return;
    }

    const identity = identities[client.id];

    return processWsMessage(service, options, context, message, identity);
  };

  return {
    type: 'Gateway',
    name: resourceName,
    options: service.options,
    identifier,
    bootstrapHandler: () => {
      registerEmulatorProvider(provider, {
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

      registerServerProvider(identifier, {
        type: ProviderType.Ws,
        connectHandler,
        disconnectHandler,
        messageHandler
      });
    },
    shutdownHandler: () => {
      unregisterServerProvider(identifier);
      unregisterEmulatorProvider(provider);
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
    }
  };
};
