import type { DeployEvent, StateEvent } from '@ez4/project/library';

import { tryCreateTrigger } from '@ez4/project/library';

import { loadStateFile, saveStateFile } from '../common/state';
import { deploy, report } from '../common/provider';

export const registerTriggers = () => {
  tryCreateTrigger('@ez4/aws-common', {
    'deploy:plan': planDeploy,
    'deploy:apply': applyDeploy,
    'state:load': loadState,
    'state:save': saveState
  });
};

const planDeploy = async (event: DeployEvent) => {
  return report(event.newState, event.oldState, event.force);
};

const applyDeploy = async (event: DeployEvent) => {
  return deploy(event.newState, event.oldState, event.concurrency, event.force);
};

const loadState = async (event: StateEvent) => {
  return loadStateFile(event.path);
};

const saveState = async (event: StateEvent) => {
  if (event.contents) {
    await saveStateFile(event.path, event.contents);
  }
};
