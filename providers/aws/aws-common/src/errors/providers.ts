export class DuplicateProviderError extends Error {
  constructor(public providerName: string) {
    super(`Provider for ${providerName} is already registered.`);
  }
}
