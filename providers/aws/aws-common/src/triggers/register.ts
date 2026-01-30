import type { DeployEvent, DeployLockEvent, StateEvent } from '@ez4/project/library';

import { tryCreateTrigger } from '@ez4/project/library';

import { loadStateFile, saveStateFile } from '../common/state';
import { deploy, report } from '../common/provider';
import { acquireExclusiveLock, releaseExclusiveLock } from '../common/lock';

export const registerTriggers = () => {
  tryCreateTrigger('@ez4/aws-common', {
    'deploy:plan': planDeploy,
    'deploy:apply': applyDeploy,
    'deploy:lock': deployLock,
    'deploy:unlock': deployUnlock,
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

const deployLock = async (event: DeployLockEvent) => {
  const success = await acquireExclusiveLock(event.lockId);

  if (!success) {
    throw new Error('Failed to acquire exclusive lock.');
  }
};

const deployUnlock = async (event: DeployLockEvent) => {
  await releaseExclusiveLock(event.lockId);
};

const loadState = async (event: StateEvent) => {
  return loadStateFile(event.path);
};

const saveState = async (event: StateEvent) => {
  if (event.contents) {
    await saveStateFile(event.path, event.contents);
  }
};
