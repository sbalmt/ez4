import type { EntryStates } from '@ez4/stateful';

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export const loadState = (filePath: string): EntryStates => {
  if (existsSync(filePath)) {
    const buffer = readFileSync(filePath);
    const stateFile = JSON.parse(buffer.toString());

    return stateFile.state ?? {};
  }

  return {};
};

export const saveState = (filePath: string, state: EntryStates) => {
  const stateFile = {
    lastUpdate: new Date().toISOString(),
    state
  };

  writeFileSync(filePath, JSON.stringify(stateFile, undefined, 2));
};
