export class Logger {
  static logInfo(serviceName: string, message: unknown) {
    console.info(`[${serviceName}]: ${message}`);
  }

  static logDebug(serviceName: string, message: unknown) {
    console.debug(`[${serviceName}]: ${message}`);
  }

  static logWarning(serviceName: string, message: unknown) {
    console.warn(`[${serviceName}]: ${message}`);
  }

  static logError(serviceName: string, message: unknown) {
    console.error(`[${serviceName}]: ${message}`);
  }

  static logCreate(serviceName: string, resourceId: string) {
    Logger.logInfo(serviceName, `Creating ${resourceId}`);
  }

  static logAttach(serviceName: string, resourceId: string, attachmentId: string) {
    Logger.logInfo(serviceName, `Attaching ${attachmentId} to ${resourceId}`);
  }

  static logUpdate(serviceName: string, resourceId: string) {
    Logger.logInfo(serviceName, `Updating ${resourceId}`);
  }

  static logFetch(serviceName: string, resourceId: string) {
    Logger.logInfo(serviceName, `Fetching ${resourceId}`);
  }

  static logTag(serviceName: string, resourceId: string) {
    Logger.logInfo(serviceName, `Tagging ${resourceId}`);
  }

  static logUntag(serviceName: string, resourceId: string) {
    Logger.logInfo(serviceName, `Untagging ${resourceId}`);
  }

  static logDetach(serviceName: string, resourceId: string, attachmentId: string) {
    Logger.logInfo(serviceName, `Detaching ${attachmentId} from ${resourceId}`);
  }

  static logDelete(serviceName: string, resourceId: string) {
    Logger.logInfo(serviceName, `Deleting ${resourceId}`);
  }
}
