import { createTrigger, DeployEvent } from '@ez4/project';

import { deploy, report } from '../common/provider.js';

let isRegistered = false;

/**
 * Register all triggers.
 */
export const registerTriggers = () => {
  if (!isRegistered) {
    createTrigger('@ez4/aws-common', {
      'deploy:plan': planDeploy,
      'deploy:apply': applyDeploy
    });

    isRegistered = true;
  }

  return isRegistered;
};

const planDeploy = async (event: DeployEvent) => {
  return report(event.newState, event.oldState);
};

const applyDeploy = async (event: DeployEvent) => {
  return deploy(event.newState, event.oldState);
};
