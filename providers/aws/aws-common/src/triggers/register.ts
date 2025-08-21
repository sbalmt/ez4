import type { DeployEvent, StateEvent } from '@ez4/project/library';

import { createTrigger } from '@ez4/project/library';

import { loadStateFile, saveStateFile } from '../common/state.js';
import { deploy, report } from '../common/provider.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  createTrigger('@ez4/aws-common', {
    'deploy:plan': planDeploy,
    'deploy:apply': applyDeploy,
    'state:load': loadState,
    'state:save': saveState
  });

  isRegistered = true;
};

const planDeploy = async (event: DeployEvent) => {
  return report(event.newState, event.oldState, event.force);
};

const applyDeploy = async (event: DeployEvent) => {
  return deploy(event.newState, event.oldState, event.force);
};

const loadState = async (event: StateEvent) => {
  return loadStateFile(event.path);
};

const saveState = async (event: StateEvent) => {
  if (event.contents) {
    await saveStateFile(event.path, event.contents);
  }
};
