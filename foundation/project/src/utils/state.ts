import type { EntryStates } from '@ez4/stateful';
import type { ProjectStateOptions } from '../types/project';
import type { DeployOptions } from '../types/options';

import { triggerAllAsync } from '@ez4/project/library';

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename } from 'node:path';

export const mergeState = (newState: EntryStates, oldState: EntryStates) => {
  for (const entityId in newState) {
    if (newState[entityId]) {
      newState[entityId].result = oldState[entityId]?.result;
    }
  }
};

export const loadState = async (stateOptions: ProjectStateOptions, deployOptions: DeployOptions) => {
  if (!stateOptions.remote) {
    const path = getPath('.', stateOptions.path);

    if (existsSync(path)) {
      return unpackState(await readFile(path));
    }

    return {};
  }

  const path = getPath(deployOptions.projectName, stateOptions.path);

  const data = await triggerAllAsync('state:load', (handler) =>
    handler({
      options: deployOptions,
      path
    })
  );

  if (data) {
    return unpackState(data);
  }

  return {};
};

export const saveState = (stateOptions: ProjectStateOptions, deployOptions: DeployOptions, state: EntryStates) => {
  const data = packState(state);

  if (!stateOptions.remote) {
    const path = getPath('.', stateOptions.path);

    return writeFile(path, data);
  }

  const path = getPath(deployOptions.projectName, stateOptions.path);

  return triggerAllAsync('state:save', (handler) =>
    handler({
      options: deployOptions,
      contents: data,
      path
    })
  );
};

const getPath = (baseDirectory: string, filePath: string) => {
  return `${baseDirectory}/${basename(filePath)}.ezstate`;
};

const packState = (state: EntryStates) => {
  const data = {
    lastUpdate: new Date().toISOString(),
    version: 1,
    state
  };

  return JSON.stringify(data, undefined, 2);
};

const unpackState = (buffer: Buffer) => {
  const data = JSON.parse(buffer.toString());

  return data.state ?? {};
};
