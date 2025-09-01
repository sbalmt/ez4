import type { EntryStates } from '@ez4/stateful';
import type { DeployOptions } from '../types/options';

import { triggerAllAsync } from '@ez4/project/library';

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename } from 'node:path';

export const combineStates = (newState: EntryStates, oldState: EntryStates) => {
  for (const entityId in newState) {
    if (newState[entityId]) {
      newState[entityId].result = oldState[entityId]?.result;
    }
  }
};

export const loadLocalState = async (filePath: string): Promise<EntryStates> => {
  if (existsSync(filePath)) {
    const buffer = await readFile(filePath);

    return unpackState(buffer);
  }

  return {};
};

export const loadRemoteState = async (filePath: string, options: DeployOptions): Promise<EntryStates> => {
  const path = getRemotePath(options.projectName, filePath);

  const buffer = await triggerAllAsync('state:load', (handler) =>
    handler({
      options,
      path
    })
  );

  if (buffer) {
    return unpackState(buffer);
  }

  return {};
};

export const saveLocalState = async (filePath: string, state: EntryStates) => {
  const contents = packState(state);

  await writeFile(filePath, contents);
};

export const saveRemoteState = async (filePath: string, options: DeployOptions, state: EntryStates) => {
  const path = getRemotePath(options.projectName, filePath);
  const contents = packState(state);

  await triggerAllAsync('state:save', (handler) =>
    handler({
      options,
      contents,
      path
    })
  );
};

const getRemotePath = (projectName: string, filePath: string) => {
  return `${projectName}/${basename(filePath)}`;
};

const packState = (state: EntryStates) => {
  const stateData = {
    lastUpdate: new Date().toISOString(),
    state
  };

  return JSON.stringify(stateData, undefined, 2);
};

const unpackState = (buffer: Buffer) => {
  const stateData = JSON.parse(buffer.toString());

  return stateData.state ?? {};
};
