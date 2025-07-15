import type { LinkedVariables } from '@ez4/project/library';

const referencesCount: Record<string, number> = {};

export const attachVariables = (variables: LinkedVariables) => {
  for (const variableName in variables) {
    const variableValue = variables[variableName];

    if (variableValue) {
      // It's already referenced, just increment the counter.
      if (variableName in referencesCount) {
        referencesCount[variableName]++;
        continue;
      }

      // It's not referenced, but already defined.
      if (variableName in process.env) {
        referencesCount[variableName] = +Infinity;
        continue;
      }

      process.env[variableName] = variableValue;

      referencesCount[variableName] = 1;
    }
  }
};

export const detachVariables = (variables: LinkedVariables) => {
  for (const variableName in variables) {
    if (variableName in referencesCount) {
      referencesCount[variableName]--;

      if (referencesCount[variableName] === 0) {
        delete referencesCount[variableName];
        delete process.env[variableName];
      }
    }
  }
};
