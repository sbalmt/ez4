import { MissingPackageError } from '../errors/common';

export class MissingEmulatorProvider extends MissingPackageError {
  constructor(public contractName: string) {
    super(`No emulator provider for contract '${contractName}' was found.`);
  }
}

export class DuplicateEmulatorProviderError extends Error {
  constructor(public identifier: string) {
    super(`Emulator provider '${identifier}' is already registered.`);
  }
}

export class EmulatorNotFoundError extends Error {
  constructor(resourceName: string) {
    super(`Emulator for resource ${resourceName} not found.`);
  }
}
