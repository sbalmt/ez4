import type { AnyServiceDescriptor } from '../types/service';

export class ExecutionTimeoutError extends Error {
  constructor() {
    super('Execution timed out before any response.');
  }
}

export class ServiceNotFoundError extends Error {
  constructor(name: string, descriptor?: AnyServiceDescriptor) {
    if (descriptor) {
      const specifier = 'module' in descriptor ? descriptor.module : descriptor.file;
      super(`Service '${name}' was not found in '${specifier}'.`);
    } else {
      super(name);
    }
  }
}

export class EntrypointNotFoundError extends Error {
  constructor(name: string, file?: string) {
    if (file) {
      super(`Entrypoint '${name}' was not found in '${file}'.`);
    } else {
      super(name);
    }
  }
}
