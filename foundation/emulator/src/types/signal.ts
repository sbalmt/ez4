import type { AnyObject } from '@ez4/utils';
import type { AnyServiceDescriptor, ServiceDescriptors, ServiceReferences } from './service';
import type { WorkerEntrypoint } from './worker';

export enum WorkerSignal {
  Start = 'start',
  Invoke = 'invoke',
  Event = 'event',
  Error = 'error',
  Data = 'data',
  Log = 'log'
}

export type WorkerSignals =
  | StartWorkerSignal
  | InvokeWorkerSignal
  | WorkerDataSignal
  | WorkerEventSignal
  | WorkerErrorSignal
  | WorkerLogSignal;

export type StartWorkerSignal = {
  signal: WorkerSignal.Start;
  manager: AnyServiceDescriptor;
  services: ServiceDescriptors;
  references: ServiceReferences;
  listener?: WorkerEntrypoint;
  handler: WorkerEntrypoint;
  timeout: number;
};

export type InvokeWorkerSignal = {
  signal: WorkerSignal.Invoke;
  request: AnyObject;
};

export type WorkerDataSignal = {
  signal: WorkerSignal.Data;
  response: unknown;
};

export type WorkerEventSignal = {
  signal: WorkerSignal.Event;
  provider: string;
  payload?: AnyObject;
  event: string;
};

export type WorkerLogSignal = {
  signal: WorkerSignal.Log;
  error: boolean;
  text: string;
};

export type WorkerErrorSignal = {
  signal: WorkerSignal.Error;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
};
