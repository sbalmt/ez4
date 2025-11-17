export class DuplicateProviderError extends Error {
  constructor(public providerName: string) {
    super(`A provider for ${providerName} is already registered.`);
  }
}
