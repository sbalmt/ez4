import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client where column null', async () => {
  const client = await makeSchemaClient();

  before(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertMany({
      data: [
        {
          id: randomUUID(),
          string: 'foo'
        },
        {
          id: randomUUID(),
          integer: 1
        },
        {
          id: randomUUID(),
          integer: 2
        }
      ]
    });
  });

  it('assert :: where column null (implicit)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        string: null
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }]);
  });

  it('assert :: where column null (explicit)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        string: {
          equal: null
        }
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }]);
  });

  it('assert :: where column null (operator)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        integer: true
      },
      where: {
        string: {
          isNull: true
        }
      }
    });

    deepEqual(records, [{ integer: 1 }, { integer: 2 }]);
  });

  it('assert :: where column not null (implicit)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        string: true
      },
      where: {
        string: {
          not: null
        }
      }
    });

    deepEqual(records, [{ string: 'foo' }]);
  });

  it('assert :: where column not null (explicit)', async () => {
    const { records } = await client.ez4_test_table.findMany({
      select: {
        string: true
      },
      where: {
        string: {
          isNull: false
        }
      }
    });

    deepEqual(records, [{ string: 'foo' }]);
  });
});
