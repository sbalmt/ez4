/**
 * WebSocket messages.
 */
export type AllMessages = WelcomeMessage | EchoMessage;

export type WelcomeMessage = {
  type: MessageType.Welcome;
  message: string;
};

export type EchoMessage = {
  type: MessageType.Echo;
  value: string;
};

export const enum MessageType {
  Welcome = 'welcome',
  Echo = 'echo'
}
