import type { ProviderOptions, HttpProviderRequest, WsProviderConnection, WsProviderMessage, HttpProviderOptions } from '../types/provider';

import { DuplicateProviderError, IncompatibleProviderError, MissingProviderError } from '../errors/provider';
import { ProviderType } from '../types/provider';

const ALL_PROVIDERS = new Map<string, ProviderOptions>();

export const registerProvider = (name: string, options: ProviderOptions) => {
  if (ALL_PROVIDERS.has(name)) {
    throw new DuplicateProviderError(name);
  }

  ALL_PROVIDERS.set(name, {
    ...options
  });
};

export const unregisterProvider = (name: string) => {
  return ALL_PROVIDERS.delete(name);
};

export const providerRegistered = (name: string, type?: ProviderType) => {
  const provider = ALL_PROVIDERS.get(name);

  if (provider) {
    return !type || provider.type === type;
  }

  return false;
};

export const notifyHttpRequest = async (name: string, request: HttpProviderRequest) => {
  const { requestHandler } = getProviderType(name, ProviderType.Http);

  const response = await requestHandler(request);

  return response;
};

export const getHttpProviderOptions = (name: string): Pick<HttpProviderOptions, 'cors'> | undefined => {
  const { cors } = getProviderType(name, ProviderType.Http);

  return {
    cors
  };
};

export const notifyWsConnect = async (name: string, connection: WsProviderConnection) => {
  const { connectHandler } = getProviderType(name, ProviderType.Ws);

  await connectHandler(connection);
};

export const notifyWsMessage = async (name: string, message: WsProviderMessage) => {
  const { messageHandler } = getProviderType(name, ProviderType.Ws);

  const response = await messageHandler(message);

  return response;
};

export const notifyWsDisconnect = async (name: string, connection: WsProviderConnection) => {
  const { disconnectHandler } = getProviderType(name, ProviderType.Ws);

  await disconnectHandler(connection);
};

const getProviderType = <T extends ProviderType>(name: string, type: T) => {
  const provider = ALL_PROVIDERS.get(name) as Extract<ProviderOptions, { type: T }>;

  if (!provider) {
    throw new MissingProviderError(name);
  }

  if (provider.type !== type) {
    throw new IncompatibleProviderError(name);
  }

  return provider;
};
