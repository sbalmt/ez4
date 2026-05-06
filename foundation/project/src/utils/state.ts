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
  const { projectName, branchName } = deployOptions;

  if (!stateOptions.remote) {
    const path = getPath('.', stateOptions.path, branchName);

    if (existsSync(path)) {
      return unpackState(await readFile(path));
    }

    return {};
  }

  const path = getPath(projectName, stateOptions.path, branchName);

  const data = await triggerAllAsync('state:load', (handler) => {
    return handler({ options: deployOptions, path });
  });

  if (data) {
    return unpackState(data);
  }

  return {};
};

export const saveState = async (stateOptions: ProjectStateOptions, deployOptions: DeployOptions, state: EntryStates) => {
  const { projectName, branchName } = deployOptions;

  const data = packState(state);

  if (!stateOptions.remote) {
    const path = getPath('.', stateOptions.path, branchName);

    return writeFile(path, data);
  }

  const path = getPath(projectName, stateOptions.path, branchName);

  return triggerAllAsync('state:save', (handler) =>
    handler({
      options: deployOptions,
      contents: data,
      path
    })
  );
};

const getPath = (baseDirectory: string, filePath: string, branchName: string) => {
  return `${baseDirectory}/${basename(filePath)}${branchName ? `-${branchName}` : ``}.ezstate`;
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
