import { MissingPackageError } from '../common/errors';

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
