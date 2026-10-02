export type WorkerEnvironment = {
  variables: Record<string, string>;
  memory: number;
};

export type WorkerEntrypoint = {
  module?: string;
  file: string;
  name: string;
};

export type WorkerOptions = {
  environment: WorkerEnvironment;
  listener?: WorkerEntrypoint;
  handler: WorkerEntrypoint;
};

export type ModuleEnvironment = WorkerEnvironment & {
  timeout: number;
};

export type ModuleEntrypoint = WorkerEntrypoint & {
  position: [number, number];
};

export type HandlerOptions = {
  environment: ModuleEnvironment;
  listener?: ModuleEntrypoint;
  handler: ModuleEntrypoint;
};
