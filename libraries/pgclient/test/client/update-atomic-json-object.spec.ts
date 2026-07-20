import { makeSchemaClient, prepareSchemaTable } from './common/schema';

import { beforeEach, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client update json atomic object', async () => {
  const client = await makeSchemaClient();

  const id = randomUUID();

  beforeEach(async () => {
    await prepareSchemaTable(client);

    await client.ez4_test_table.insertOne({
      data: {
        json: {
          number: 123,
          boolean: true,
          object: {
            baz: false,
            foo: 'abc',
            qux: 1.0
          }
        },
        extensible_json: {
          foo: 'abc',
          bar: 123
        },
        id
      }
    });
  });

  it('assert :: combine objects', async () => {
    const result = await client.ez4_test_table.updateOne({
      data: {
        json: {
          string: 'abc',
          number: 456,
          object: {
            bar: 456,
            baz: true
          }
        }
      },
      where: {
        id
      }
    });

    deepEqual(result, undefined);

    const changes = await client.ez4_test_table.findOne({
      select: {
        json: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      json: {
        boolean: true,
        string: 'abc',
        number: 456,
        object: {
          foo: 'abc',
          bar: 456,
          baz: true,
          qux: 1.0
        }
      }
    });
  });

  it('assert :: replace object', async () => {
    const result = await client.ez4_test_table.updateOne({
      data: {
        json: {
          replaceWith: {
            string: 'abc',
            number: 456
          }
        }
      },
      where: {
        id
      }
    });

    deepEqual(result, undefined);

    const changes = await client.ez4_test_table.findOne({
      select: {
        json: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      json: {
        string: 'abc',
        number: 456
      }
    });
  });

  it('assert :: remove object field', async () => {
    const result = await client.ez4_test_table.updateOne({
      data: {
        json: {
          boolean: false,
          number: {
            removeFrom: true
          },
          object: {
            qux: {
              removeFrom: true
            }
          }
        }
      },
      where: {
        id
      }
    });

    deepEqual(result, undefined);

    const changes = await client.ez4_test_table.findOne({
      select: {
        json: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      json: {
        boolean: false,
        object: {
          baz: false,
          foo: 'abc'
        }
      }
    });
  });

  it('assert :: combine objects (extensible)', async () => {
    const result = await client.ez4_test_table.updateOne({
      data: {
        extensible_json: {
          bar: 456,
          baz: true,
          nestedA: {
            nestedB: {
              qux: 'def'
            }
          }
        }
      },
      where: {
        id
      }
    });

    deepEqual(result, undefined);

    const changes = await client.ez4_test_table.findOne({
      select: {
        extensible_json: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      extensible_json: {
        foo: 'abc',
        bar: 456,
        baz: true,
        nestedA: {
          nestedB: {
            qux: 'def'
          }
        }
      }
    });
  });

  it('assert :: replace object (extensible)', async () => {
    const result = await client.ez4_test_table.updateOne({
      data: {
        extensible_json: {
          replaceWith: {
            foo: 'abc',
            bar: 123,
            nestedA: {
              nestedB: {
                baz: 'def'
              }
            }
          }
        }
      },
      where: {
        id
      }
    });

    deepEqual(result, undefined);

    const changes = await client.ez4_test_table.findOne({
      select: {
        extensible_json: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      extensible_json: {
        foo: 'abc',
        bar: 123,
        nestedA: {
          nestedB: {
            baz: 'def'
          }
        }
      }
    });
  });
});
