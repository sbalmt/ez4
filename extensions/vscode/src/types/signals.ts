import type { ManifestAction } from '@ez4/project/library';
import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

export const enum SignalType {
  WebviewUpdate = 'wv-update',
  WebviewResult = 'wv-result',
  WebviewTheme = 'wv-theme',
  Store = 'store',
  Ready = 'ready',
  Show = 'show',
  Run = 'run'
}

export type AnyWebviewSignal = WebviewUpdateSignal | WebviewResultSignal | WebviewThemeSignal;

export type AnyActionSignal = ReadySignal | StoreSignal | ShowSignal | RunSignal;

export type WebviewUpdateSignal = {
  type: SignalType.WebviewUpdate;
  action: ManifestAction<ObjectSchema>;
  state?: AnyObject;
};

export type WebviewResultSignal = {
  type: SignalType.WebviewResult;
  success: boolean;
  results?: AnyObject;
  status?: string;
  time?: number;
};

export type WebviewThemeSignal = {
  type: SignalType.WebviewTheme;
  name: string;
};

export type ReadySignal = {
  type: SignalType.Ready;
};

export type StoreSignal = {
  type: SignalType.Store;
  data: AnyObject;
};

export type ShowSignal = {
  type: SignalType.Show;
  path: string;
};

export type RunSignal = {
  type: SignalType.Run;
  data: RunData;
};

export type RunData = {
  headers?: Record<string, string>;
  parameters?: Record<string, string>;
  query?: Record<string, string>;
  body?: AnyObject | string;
};
