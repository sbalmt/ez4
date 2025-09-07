import { makeSchemaClient, prepareSchemaTable } from './common/database';

import { beforeEach, describe, it } from 'node:test';
import { deepEqual, equal } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client insert many', async () => {
  const client = await makeSchemaClient();

  beforeEach(async () => {
    await prepareSchemaTable(client);
  });

  it('assert :: insert many booleans', async () => {
    const inputs = [{ boolean: true }, { boolean: false }, { boolean: true }];

    const result = await client.ez4_test_table.insertMany({
      data: inputs.map((input) => ({
        id: randomUUID(),
        ...input
      }))
    });

    deepEqual(result, undefined);

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      select: {
        boolean: true
      }
    });

    deepEqual(records, inputs);

    equal(total, 3);
  });

  it('assert :: insert many integers', async () => {
    const inputs = [{ integer: 1 }, { integer: 22 }, { integer: 333 }];

    const result = await client.ez4_test_table.insertMany({
      data: inputs.map((input) => ({
        id: randomUUID(),
        ...input
      }))
    });

    deepEqual(result, undefined);

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      select: {
        integer: true
      }
    });

    deepEqual(records, inputs);

    equal(total, 3);
  });

  it('assert :: insert many decimals', async () => {
    const inputs = [{ decimal: 0.1 }, { decimal: 1.22 }, { decimal: 2.333 }];

    const result = await client.ez4_test_table.insertMany({
      data: inputs.map((input) => ({
        id: randomUUID(),
        ...input
      }))
    });

    deepEqual(result, undefined);

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      select: {
        decimal: true
      }
    });

    deepEqual(records, inputs);

    equal(total, 3);
  });

  it('assert :: insert many strings', async () => {
    const inputs = [{ string: 'foo' }, { string: 'bar' }, { string: 'baz' }];

    const result = await client.ez4_test_table.insertMany({
      data: inputs.map((input) => ({
        id: randomUUID(),
        ...input
      }))
    });

    deepEqual(result, undefined);

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      select: {
        string: true
      }
    });

    deepEqual(records, inputs);

    equal(total, 3);
  });

  it('assert :: insert many date-times', async () => {
    const inputs = [
      { datetime: '1991-04-23T23:59:30.000Z' },
      { datetime: '2024-07-01T08:00:00.000Z' },
      { datetime: '2011-11-02T13:30:00.000Z' }
    ];

    const result = await client.ez4_test_table.insertMany({
      data: inputs.map((input) => ({
        id: randomUUID(),
        ...input
      }))
    });

    deepEqual(result, undefined);

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      select: {
        datetime: true
      }
    });

    deepEqual(records, inputs);

    equal(total, 3);
  });

  it('assert :: insert many dates', async () => {
    const inputs = [{ date: '1991-04-23' }, { date: '2024-07-01' }, { date: '2011-11-02' }];

    const result = await client.ez4_test_table.insertMany({
      data: inputs.map((input) => ({
        id: randomUUID(),
        ...input
      }))
    });

    deepEqual(result, undefined);

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      select: {
        date: true
      }
    });

    deepEqual(records, inputs);

    equal(total, 3);
  });

  it('assert :: insert many times', async () => {
    const inputs = [{ time: '23:59:30.000Z' }, { time: '08:00:00.000Z' }, { time: '13:30:00.000Z' }];

    const result = await client.ez4_test_table.insertMany({
      data: inputs.map((input) => ({
        id: randomUUID(),
        ...input
      }))
    });

    deepEqual(result, undefined);

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      select: {
        time: true
      }
    });

    deepEqual(records, inputs);

    equal(total, 3);
  });

  it('assert :: insert many jsons', async () => {
    const inputs = [
      {
        json: { boolean: true, string: 'abc' }
      },
      {
        json: { boolean: false, string: 'def', number: 123 }
      },
      {
        json: { boolean: true, string: 'abc', datetime: '2024-07-01T08:00:00.000Z' }
      }
    ];

    const result = await client.ez4_test_table.insertMany({
      data: inputs.map((input) => ({
        id: randomUUID(),
        ...input
      }))
    });

    deepEqual(result, undefined);

    const { records, total } = await client.ez4_test_table.findMany({
      count: true,
      select: {
        json: true
      }
    });

    deepEqual(records, inputs);

    equal(total, 3);
  });
});
