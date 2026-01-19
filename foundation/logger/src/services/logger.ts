import { LogFormat } from '../utils/format';
import { LogColor } from '../types/color';
import { LogLevel } from '../types/level';
import { TTY } from '../utils/tty';

let currentLevel: LogLevel = LogLevel.Debug;

export namespace Logger {
  export const setLevel = (logLevel: LogLevel) => {
    currentLevel = logLevel;
  };

  export const log = (message: string) => {
    for (const line of message.split('\n')) {
      process.stdout.write(`${line}\n`);
    }
  };

  export const debug = (message: string) => {
    if (currentLevel >= LogLevel.Debug) {
      log(message);
    }
  };

  export const info = (message: string) => {
    if (currentLevel >= LogLevel.Information) {
      for (const line of message.split('\n')) {
        process.stderr.write(`ℹ️  ${line}\n`);
      }
    }
  };

  export const warn = (message: string) => {
    if (currentLevel >= LogLevel.Warning) {
      for (const line of message.split('\n')) {
        process.stderr.write(`⚠️  ${LogFormat.toColor(LogColor.Red, line)}\n`);
      }
    }
  };

  export const error = (message: string) => {
    if (currentLevel >= LogLevel.Error) {
      for (const line of message.split('\n')) {
        process.stderr.write(`❌ ${LogFormat.toColor(LogColor.Red, line)}\n`);
      }
    }
  };

  export const success = (message: string) => {
    if (currentLevel >= LogLevel.Error) {
      for (const line of message.split('\n')) {
        process.stderr.write(`✅ ${line}\n`);
      }
    }
  };

  export const clear = () => {
    process.stdout.write('\x1Bc\r');
  };

  export const space = () => {
    process.stdout.write('\n');
  };

  TTY.setup();
}
