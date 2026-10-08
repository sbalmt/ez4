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
  services: ServiceDescriptors;
  references: ServiceReferences;
  invoker: AnyServiceDescriptor;
  listener?: WorkerEntrypoint;
  handler: WorkerEntrypoint;
  timeout: number;
};

export type InvokeWorkerSignal = {
  signal: WorkerSignal.Invoke;
  request: AnyObject;
  id?: string;
};

export type WorkerDataSignal = {
  signal: WorkerSignal.Data;
  response: unknown;
  id?: string;
};

export type WorkerEventSignal = {
  signal: WorkerSignal.Event;
  provider: string;
  payload?: AnyObject;
  event: string;
  id?: string;
};

export type WorkerLogSignal = {
  signal: WorkerSignal.Log;
  error: boolean;
  text: string;
};

export type WorkerErrorSignal = {
  signal: WorkerSignal.Error;
  id?: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
};
