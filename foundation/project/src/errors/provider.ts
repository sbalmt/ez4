import { MissingPackageError } from './common';

export class MissingResourceProvider extends MissingPackageError {
  constructor(public contractName: string) {
    super(`No resource provider for contract '${contractName}' was found.`);
  }
}

export class MissingActionProviderError extends Error {
  constructor(public resourceName: string) {
    super(`No action providers for '${resourceName}' were found.`);
  }
}

export class ProviderVersionMismatchError extends Error {
  constructor() {
    super(`All providers must be on the same version.`);
  }
}
