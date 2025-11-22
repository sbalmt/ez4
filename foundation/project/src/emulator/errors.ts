import { MissingPackageError } from '../common/errors';

export class MissingEmulatorProvider extends MissingPackageError {
  constructor(public contractName: string) {
    super(`No emulator provider for contract '${contractName}' was found.`);
  }
}

export class EmulatorNotFoundError extends Error {
  constructor(resourceName: string) {
    super(`Emulator for resource ${resourceName} not found.`);
  }
}

export class EmulatorClientNotFoundError extends Error {
  constructor(resourceName: string) {
    super(`Resource ${resourceName} doesn't provide any service client.`);
  }
}
