import type { EntryStates } from '@ez4/state';
import type { InputOptions } from '../options';
import type { LoadedProjectOptions } from '../../config/project';
import type { ReferenceProject } from '../../config/references';
import type { DeployOptions } from '../../types/options';

import { Logger, DynamicLogger, LogLevel } from '@ez4/logger';

import { applyDeploy } from '../../deploy/apply';
import { performDeploy } from '../../deploy/perform';
import { getEventContext } from '../../deploy/context';
import { prepareExecutionRole } from '../../deploy/identity';
import { prepareLinkedServices } from '../../deploy/services';
import { mergeState, loadState, saveState } from '../../utils/state';
import { connectDeployResources, prepareDeployResources } from '../../deploy/resources';
import { reportResourceChanges } from '../../deploy/changes';
import { reportResourcesOutput } from '../../deploy/output';
import { getDeployOptions } from '../../deploy/options';
import { loadEnvironment } from '../../config/environment';
import { loadReferences } from '../../config/references';
import { loadProviders } from '../../config/providers';
import { loadProject } from '../../config/project';
import { buildMetadata } from '../../library/metadata';
import { warnUnsupportedFlags } from '../../utils/flags';
import { waitConfirmation } from '../../utils/prompt';
import { exposeAllWarnings } from '../../utils/warnings';
import { assertNoErrors } from '../../utils/errors';

type DeploymentPlan = {
  options: DeployOptions;
  project: LoadedProjectOptions;
  hasChanges: boolean;
  newState: EntryStates;
  oldState: EntryStates;
};

export const deployCommand = async (input: InputOptions) => {
  if (input.environment) {
    loadEnvironment(input.environment);
  }

  const project = await loadProject(input.project);
  const options = getDeployOptions(input, project);

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  const list = await DynamicLogger.logExecution('⚡ Initializing', async () => {
    const { list: references } = await loadReferences(project);

    const list = references.filter(({ project }) => {
      const { projectName, deployOptions } = project;

      if (deployOptions?.disabled) {
        Logger.log(`ℹ️  [${projectName}] Deployment disabled`);
        return false;
      }

      return true;
    });

    const operations = list.map(({ project }) => {
      return loadProviders(project);
    });

    await Promise.all(operations);

    return list;
  });

  if (options.force) {
    Logger.log('❗ Force option is enabled');
  }

  warnUnsupportedFlags(input, {
    environment: true,
    force: true
  });

  if (!list.length) {
    return Logger.log('ℹ️  No projects enabled for deployment');
  }

  const plans: DeploymentPlan[] = [];

  for (const reference of list) {
    const plan = await prepareDeploymentPlan(reference, input);
    plans.push(plan);
  }

  const plansWithChanges = plans.filter((plan) => plan.hasChanges || plan.options.force);

  if (!plansWithChanges.length) {
    return Logger.log('ℹ️  No changes');
  }

  const requiresConfirmation = plansWithChanges.some((plan) => plan.project.confirmMode !== false);

  if (requiresConfirmation) {
    const canProceed = await waitConfirmation('Are you sure you want to proceed?');

    if (!canProceed) {
      return Logger.log('⛔ Aborted');
    }
  }

  for (const plan of plansWithChanges) {
    const deployState = await performDeploy(plan.options, async () => {
      const { result, errors, warnings } = await applyDeploy(plan.newState, plan.oldState, plan.options);

      await DynamicLogger.logExecution(`✅ [${plan.project.projectName}] Saving state`, () => {
        return saveState(plan.project.stateFile, plan.options, result);
      });

      return {
        result,
        warnings,
        errors
      };
    });

    reportResourcesOutput(deployState.result);
    exposeAllWarnings(deployState.warnings);
    assertNoErrors(deployState.errors);
  }
};

const prepareDeploymentPlan = async (reference: ReferenceProject, input: InputOptions): Promise<DeploymentPlan> => {
  const { project, imports, paths } = reference;

  const options = getDeployOptions(input, project);

  options.imports = imports;

  const newState: EntryStates = {};

  const [oldState, { metadata, dependencies }] = await DynamicLogger.logExecution(
    `🔄️ [${project.projectName}] Loading metadata and state`,
    () => {
      return Promise.all([
        loadState(project.stateFile, options),
        buildMetadata(project.sourceFiles, {
          workspacePath: project.workspacePath,
          aliasPaths: paths
        })
      ]);
    }
  );

  const role = await prepareExecutionRole(newState, metadata, options);
  const context = getEventContext(dependencies, role);

  await prepareDeployResources(newState, metadata, context, options);
  await prepareLinkedServices(metadata, context, options);
  await connectDeployResources(newState, metadata, context, options);

  mergeState(newState, oldState);

  const hasChanges = await reportResourceChanges(newState, oldState, options);

  if (!hasChanges && !options.force) {
    Logger.log(`ℹ️  [${project.projectName}] No changes found`);
    reportResourcesOutput(newState);
  }

  return {
    project,
    options,
    hasChanges,
    newState,
    oldState
  };
};
