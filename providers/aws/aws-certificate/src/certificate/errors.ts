export class CertificateDeletionDeniedError extends Error {
  constructor(domainName: string) {
    super(`Deletion protection for certificate (used by: ${domainName}) is enabled.`);
  }
}
