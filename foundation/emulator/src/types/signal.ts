import type { AnyObject } from '@ez4/utils';
import type { ServiceAnyDescriptor, ServiceDescriptors } from './service';
import type { WorkerEntrypoint } from './worker';

export enum WorkerSignal {
  Start = 'start',
  Invoke = 'invoke',
  Result = 'result',
  Error = 'error'
}

export type WorkerSignals = StartWorkerSignal | InvokeWorkerSignal | WorkerResultSignal | WorkerErrorSignal;

export type StartWorkerSignal = {
  signal: WorkerSignal.Start;
  manager: ServiceAnyDescriptor;
  services: ServiceDescriptors;
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

export type WorkerErrorSignal = {
  signal: WorkerSignal.Error;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
};
