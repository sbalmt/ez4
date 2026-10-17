export const enum ProviderEvent {
  SendMessage = 'send-message',
  Disconnect = 'disconnect'
}

export type ProviderConnectionEvent = {
  connectionId: string;
  payload?: string;
};
