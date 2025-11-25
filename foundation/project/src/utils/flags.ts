import type { InputOptions } from '../terminal/options';

import { Logger } from './logger';

export type SupportedFlags = {
  arguments?: boolean;
  reset?: boolean;
  force?: boolean;
  local?: boolean;
};

export const warnUnsupportedFlags = (input: InputOptions, flags?: SupportedFlags) => {
  const warnMessages = [];

  if (input.forceMode && !flags?.force) {
    warnMessages.push('Option --force take no effect');
  }

  if (input.resetMode && !flags?.reset) {
    warnMessages.push('Option --reset take no effect');
  }

  if (input.localMode && !flags?.local) {
    warnMessages.push('Option --local take no effect');
  }

  if (input.arguments?.length && !flags?.arguments) {
    warnMessages.push('Arguments take no effect');
  }

  if (warnMessages.length) {
    warnMessages.forEach((line) => Logger.warn(line));

    return true;
  }

  return false;
};
