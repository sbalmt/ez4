import { window } from 'vscode';

export namespace LoggerService {
  const logger = window.createOutputChannel('EZ4', {
    log: true
  });

  export const get = () => {
    return logger;
  };
}
