import { LogColor, LogFormat, Logger } from '@ez4/logger';

export const logRequest = (method?: string, url?: string) => {
  Logger.log(`➡️  ${method} ${url}`);
};

export const logSuccess = (status: number, url?: string) => {
  Logger.log(`⬅️  ${status} ${url ?? '/'}`);
};

export const logFailure = (status: number, url?: string) => {
  Logger.log(LogFormat.toColor(LogColor.Red, `⬅️  ${status} ${url ?? '/'}`));
};

export const logConnection = (provider: string) => {
  Logger.log(`🟩 [${provider}] WS connection open`);
};

export const logDisconnection = (provider: string) => {
  Logger.log(`🟥 [${provider}] WS connection closed`);
};

export const logError = (provider: string, error: unknown) => {
  if (error instanceof Error && error.stack) {
    Logger.error(`[${provider}] ${error.stack}`);
  } else {
    Logger.error(`[${provider}] ${error}`);
  }
};
