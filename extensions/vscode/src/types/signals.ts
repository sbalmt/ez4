export const enum SignalType {
  WebviewUpdate = 'wv-update'
}

export type AnySignal = WebviewUpdateSignal;

export type WebviewUpdateSignal = {
  type: SignalType;
};
