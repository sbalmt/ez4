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

  static logCreate(serviceName: string, resource: string) {
    Logger.logInfo(serviceName, `Creating ${resource}`);
  }

  static logImport(serviceName: string, resource: string) {
    Logger.logInfo(serviceName, `Importing ${resource}`);
  }

  static logAttach(serviceName: string, resource: string, attachment: string) {
    Logger.logInfo(serviceName, `Attaching ${attachment} to ${resource}`);
  }

  static logUpdate(serviceName: string, resource: string) {
    Logger.logInfo(serviceName, `Updating ${resource}`);
  }

  static logFetch(serviceName: string, resource: string) {
    Logger.logInfo(serviceName, `Fetching ${resource}`);
  }

  static logTag(serviceName: string, resource: string) {
    Logger.logInfo(serviceName, `Tagging ${resource}`);
  }

  static logUntag(serviceName: string, resource: string) {
    Logger.logInfo(serviceName, `Untagging ${resource}`);
  }

  static logDetach(serviceName: string, resource: string, attachment: string) {
    Logger.logInfo(serviceName, `Detaching ${attachment} from ${resource}`);
  }

  static logDelete(serviceName: string, resource: string) {
    Logger.logInfo(serviceName, `Deleting ${resource}`);
  }

  static logWait(serviceName: string, resource: string) {
    Logger.logInfo(serviceName, `Waiting ${resource}`);
  }
}
