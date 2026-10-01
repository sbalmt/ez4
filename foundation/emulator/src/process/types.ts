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
  entrypoint: WorkerEntrypoint;
};

export type HandlerFunction = (...inputs: unknown[]) => unknown;

export type HandlerEnvironment = WorkerEnvironment & {
  timeout: number;
};

export type HandlerEntrypoint = WorkerEntrypoint & {
  position: [number, number];
};

export type HandlerOptions = {
  environment: HandlerEnvironment;
  entrypoint: HandlerEntrypoint;
};
