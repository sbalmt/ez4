import type { InputOptions } from '../terminal/options';

import { Logger } from '@ez4/logger';

const OPTION_FLAGS = ['force', 'inspect', 'coverage', 'suppress', 'reset', 'local'] as const;

type OptionFlags = {
  [F in (typeof OPTION_FLAGS)[number]]?: boolean;
};

type ArgumentFlags = {
  arguments?: boolean;
};

export type SupportedFlags = ArgumentFlags & OptionFlags;

export const warnUnsupportedFlags = (input: InputOptions, flags?: SupportedFlags) => {
  const warnMessages = [];

  if (input.arguments?.length && !flags?.arguments) {
    warnMessages.push('Arguments take no effect');
  }

  for (const flag of OPTION_FLAGS) {
    if (input[flag] && !flags?.[flag]) {
      warnMessages.push(`Option --${flag} take no effect`);
    }
  }

  if (warnMessages.length) {
    warnMessages.forEach((line) => Logger.warn(line));

    return true;
  }

  return false;
};
