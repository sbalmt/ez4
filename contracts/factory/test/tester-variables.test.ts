import type { TestVariablesConflict, TestVariablesFirst, TestVariablesSecond } from './cases/variables';

import { deepEqual, equal, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DuplicateVariablesError } from '@ez4/emulator';
import { FactoryTester } from '@ez4/factory/tester';

describe('factory tester (environment variables)', () => {
  it('assert :: injects declared variables, aliases, defaults and nested factory variables', async () => {
    const environment = { ...process.env };

    const client = await FactoryTester.getClient<TestVariablesFirst>('TestVariablesFirst');

    equal(client.read(), 'first');
    equal(client.readAlias(), process.env.PATH);
    equal(client.readDefault(), process.env.EZ4_FACTORY_UNSET_SOURCE ?? 'default-value');
    equal(client.readDependency(), 'dependency');

    deepEqual({ ...process.env }, environment);
  });

  it('assert :: concurrent factories keep their environment for later reads', async () => {
    const environment = { ...process.env };

    const [first, second] = await Promise.all([
      FactoryTester.getClient<TestVariablesFirst>('TestVariablesFirst'),
      FactoryTester.getClient<TestVariablesSecond>('TestVariablesSecond')
    ]);

    equal(first.read(), 'first');
    equal(second.read(), 'second');
    equal(first.read(), 'first');
    equal(first.readDependency(), 'dependency');

    deepEqual({ ...process.env }, environment);
  });

  it('assert :: conflicting nested variables reject without leaking into subsequent clients', async () => {
    const environment = { ...process.env };

    await rejects(FactoryTester.getClient<TestVariablesConflict>('TestVariablesConflict'), DuplicateVariablesError);

    const client = await FactoryTester.getClient<TestVariablesFirst>('TestVariablesFirst');

    equal(client.read(), 'first');

    deepEqual({ ...process.env }, environment);
  });
});
