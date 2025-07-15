import type { LinkedVariables } from '@ez4/project/library';

const referencesCount: Record<string, number> = {};

export const attachVariables = (variables: LinkedVariables) => {
  for (const variableName in variables) {
    const variableValue = variables[variableName];

    if (variableValue) {
      if (!referencesCount[variableName]) {
        process.env[variableName] = variableValue;
        referencesCount[variableName] = 0;
      }

      referencesCount[variableName]++;
    }
  }
};

export const detachVariables = (variables: LinkedVariables) => {
  for (const variableName in variables) {
    if (referencesCount[variableName] && --referencesCount[variableName] <= 0) {
      delete referencesCount[variableName];
      delete process.env[variableName];
    }
  }
};
