import type { InputOptions } from '../terminal/options';

import { Logger } from './logger';

export type SupportedFlags = {
  arguments?: boolean;
  force?: boolean;
  suppress?: boolean;
  reset?: boolean;
  local?: boolean;
};

export const warnUnsupportedFlags = (input: InputOptions, flags?: SupportedFlags) => {
  const warnMessages = [];

  if (input.arguments?.length && !flags?.arguments) {
    warnMessages.push('Arguments take no effect');
  }

  if (input.force && !flags?.force) {
    warnMessages.push('Option --force take no effect');
  }

  if (input.suppress && !flags?.suppress) {
    warnMessages.push('Option --suppress take no effect');
  }

  if (input.reset && !flags?.reset) {
    warnMessages.push('Option --reset take no effect');
  }

  if (input.local && !flags?.local) {
    warnMessages.push('Option --local take no effect');
  }

  if (warnMessages.length) {
    warnMessages.forEach((line) => Logger.warn(line));

    return true;
  }

  return false;
};
