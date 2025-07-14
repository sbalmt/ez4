export class MissingActionProviderError extends Error {
  constructor(public resourceName: string) {
    super(`No action providers for '${resourceName}' were found.`);
  }
}

export class MissingResourceProvider extends Error {
  constructor(public contractName: string) {
    super(`No resource provider for contract '${contractName}' was found.`);
  }
}

export class MissingEmulatorProvider extends Error {
  constructor(public contractName: string) {
    super(`No emulator provider for contract '${contractName}' was found.`);
  }
}
