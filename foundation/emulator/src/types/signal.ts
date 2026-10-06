import type { AnyObject } from '@ez4/utils';
import type { AnyServiceDescriptor, ServiceDescriptors, ServiceReferences } from './service';
import type { WorkerEntrypoint } from './worker';

export enum WorkerSignal {
  Start = 'start',
  Invoke = 'invoke',
  Result = 'result',
  Event = 'event',
  Error = 'error',
  Log = 'log'
}

export type WorkerSignals =
  | StartWorkerSignal
  | InvokeWorkerSignal
  | WorkerResultSignal
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
};

export type InvokeWorkerSignal = {
  signal: WorkerSignal.Invoke;
  request: AnyObject;
};

export type WorkerResultSignal = {
  signal: WorkerSignal.Result;
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
