import { createTrigger, DeployEvent } from '@ez4/project/library';

import { deploy, report } from '../common/provider.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  createTrigger('@ez4/aws-common', {
    'deploy:plan': planDeploy,
    'deploy:apply': applyDeploy
  });

  isRegistered = true;
};

const planDeploy = async (event: DeployEvent) => {
  return report(event.newState, event.oldState);
};

const applyDeploy = async (event: DeployEvent) => {
  return deploy(event.newState, event.oldState);
};
