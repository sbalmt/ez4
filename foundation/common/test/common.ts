import { ok } from 'node:assert/strict';

import { getReflection } from '@ez4/project/library';
import { isClassDeclaration } from '@ez4/common/library';
import { isModelProperty } from '@ez4/reflection';

export const loadTestMember = (fileName: string) => {
  const sourceFile = `./test/input/${fileName}.ts`;
  const reflection = getReflection([sourceFile]);

  const entryKey = Object.keys(reflection).find((key) => key.endsWith('CommonTest'));

  ok(entryKey);

  const testType = reflection[entryKey];

  ok(isClassDeclaration(testType));

  ok(testType.members);

  const members = testType.members.filter((member) => {
    return isModelProperty(member);
  });

  ok(members.length);

  return {
    reflection,
    members
  };
};
