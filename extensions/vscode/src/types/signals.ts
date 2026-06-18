import type { ManifestAction } from '@ez4/project/library';
import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

export const enum SignalType {
  WebviewUpdate = 'wv-update',
  WebviewResults = 'wv-results',
  RunAction = 'run-action'
}

export type AnyWebviewSignal = WebviewUpdateSignal | WebviewResultsSignal;

export type AnyActionSignal = RunActionSignal;

export type WebviewUpdateSignal = {
  type: SignalType.WebviewUpdate;
  action: ManifestAction<ObjectSchema>;
};

export type WebviewResultsSignal = {
  type: SignalType.WebviewResults;
  success: boolean;
  results?: AnyObject;
  status?: string;
  time?: number;
};

export type RunActionSignal = {
  type: SignalType.RunAction;
  payload: ActionPayload;
};

export type ActionPayload = {
  headers?: Record<string, string>;
  parameters?: Record<string, string>;
  query?: Record<string, string>;
  body?: AnyObject | string;
};
