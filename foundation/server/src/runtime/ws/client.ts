import type { WsProviderClient } from '../../types/provider';

const ALL_CLIENTS = new Map<string, WsProviderClient>();

export const registerWsClient = (client: WsProviderClient) => {
  ALL_CLIENTS.set(client.id, client);
};

export const unregisterWsClient = (id: string) => {
  ALL_CLIENTS.delete(id);
};

export const getWsClient = (id: string) => {
  return ALL_CLIENTS.get(id);
};
