export class DuplicateProviderError extends Error {
  constructor(provider: string) {
    super(`The given provider '${provider}' is already registered.`);
  }
}

export class MissingProviderError extends Error {
  constructor(provider: string) {
    super(`The given provider '${provider}' was not registered.`);
  }
}

export class IncompatibleProviderError extends Error {
  constructor(provider: string) {
    super(`The given provider '${provider}' is not compatible.`);
  }
}
