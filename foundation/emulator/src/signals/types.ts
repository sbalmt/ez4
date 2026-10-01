export enum WorkerSignal {
  Start = 'start',
  Ready = 'ready',
  Invoke = 'invoke',
  Result = 'result',
  Error = 'error'
}

export type WorkerSignals = StartWorkerSignal | WorkerReadySignal | InvokeWorkerSignal | WorkerResultSignal | WorkerErrorSignal;

export type StartWorkerSignal = {
  signal: WorkerSignal.Start;
  module?: string;
  file: string;
  name: string;
};

export type WorkerReadySignal = {
  signal: WorkerSignal.Ready;
};

export type InvokeWorkerSignal = {
  signal: WorkerSignal.Invoke;
  inputs: unknown[];
};

export type WorkerResultSignal = {
  signal: WorkerSignal.Result;
  output: unknown;
};

export type WorkerErrorSignal = {
  signal: WorkerSignal.Error;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
};
