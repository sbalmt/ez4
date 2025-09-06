import { makeSchemaClient, prepareSchemaTable } from './common/database';

import { beforeEach, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client upsert one', async () => {
  const client = await makeSchemaClient();

  const id = randomUUID();

  beforeEach(async () => {
    await prepareSchemaTable(client);
  });

  it('assert :: upsert one and select boolean', async () => {
    const upsert = () => {
      return client.ez4_test_table.upsertOne({
        select: {
          boolean: true
        },
        insert: {
          boolean: true,
          id
        },
        update: {
          boolean: false
        },
        where: {
          id
        }
      });
    };

    const resultA = await upsert();

    deepEqual(resultA, {
      boolean: true
    });

    const resultB = await upsert();

    deepEqual(resultB, {
      boolean: true
    });

    const changes = await client.ez4_test_table.findOne({
      select: {
        boolean: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      boolean: false
    });
  });

  it('assert :: upsert one and select integer', async () => {
    const upsert = () => {
      return client.ez4_test_table.upsertOne({
        select: {
          integer: true
        },
        insert: {
          integer: 122333,
          id
        },
        update: {
          integer: 444455555
        },
        where: {
          id
        }
      });
    };

    const resultA = await upsert();

    deepEqual(resultA, {
      integer: 122333
    });

    const resultB = await upsert();

    deepEqual(resultB, {
      integer: 122333
    });

    const changes = await client.ez4_test_table.findOne({
      select: {
        integer: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      integer: 444455555
    });
  });

  it('assert :: upsert one and select decimal', async () => {
    const upsert = () => {
      return client.ez4_test_table.upsertOne({
        select: {
          decimal: true
        },
        insert: {
          decimal: 9.01234,
          id
        },
        update: {
          decimal: 10.5678
        },
        where: {
          id
        }
      });
    };

    const resultA = await upsert();

    deepEqual(resultA, {
      decimal: 9.01234
    });

    const resultB = await upsert();

    deepEqual(resultB, {
      decimal: 9.01234
    });

    const changes = await client.ez4_test_table.findOne({
      select: {
        decimal: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      decimal: 10.5678
    });
  });

  it('assert :: upsert one and select string', async () => {
    const upsert = () => {
      return client.ez4_test_table.upsertOne({
        select: {
          string: true
        },
        insert: {
          string: 'abc',
          id
        },
        update: {
          string: 'def'
        },
        where: {
          id
        }
      });
    };

    const resultA = await upsert();

    deepEqual(resultA, {
      string: 'abc'
    });

    const resultB = await upsert();

    deepEqual(resultB, {
      string: 'abc'
    });

    const changes = await client.ez4_test_table.findOne({
      select: {
        string: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      string: 'def'
    });
  });

  it('assert :: upsert one and select date-time', async () => {
    const upsert = () => {
      return client.ez4_test_table.upsertOne({
        select: {
          datetime: true
        },
        insert: {
          datetime: '1991-04-23T23:59:30.000Z',
          id
        },
        update: {
          datetime: '2024-07-01T08:00:00.000Z'
        },
        where: {
          id
        }
      });
    };

    const resultA = await upsert();

    deepEqual(resultA, {
      datetime: '1991-04-23T23:59:30.000Z'
    });

    const resultB = await upsert();

    deepEqual(resultB, {
      datetime: '1991-04-23T23:59:30.000Z'
    });

    const changes = await client.ez4_test_table.findOne({
      select: {
        datetime: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      datetime: '2024-07-01T08:00:00.000Z'
    });
  });

  it('assert :: upsert one and select date', async () => {
    const upsert = () => {
      return client.ez4_test_table.upsertOne({
        select: {
          date: true
        },
        insert: {
          date: '1991-04-23',
          id
        },
        update: {
          date: '2024-07-01'
        },
        where: {
          id
        }
      });
    };

    const resultA = await upsert();

    deepEqual(resultA, {
      date: '1991-04-23'
    });

    const resultB = await upsert();

    deepEqual(resultB, {
      date: '1991-04-23'
    });

    const changes = await client.ez4_test_table.findOne({
      select: {
        date: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      date: '2024-07-01'
    });
  });

  it('assert :: upsert one and select time', async () => {
    const upsert = () =>
      client.ez4_test_table.upsertOne({
        select: {
          time: true
        },
        insert: {
          time: '23:59:30',
          id
        },
        update: {
          time: '00:00:00'
        },
        where: {
          id
        }
      });

    const resultA = await upsert();

    deepEqual(resultA, {
      time: '23:59:30.000Z'
    });

    const resultB = await upsert();

    deepEqual(resultB, {
      time: '23:59:30.000Z'
    });

    const changes = await client.ez4_test_table.findOne({
      select: {
        time: true
      },
      where: {
        id
      }
    });

    deepEqual(changes, {
      time: '00:00:00.000Z'
    });
  });

  it('assert :: upsert one and select json (all fields)', async () => {
    const upsert = () => {
      return client.ez4_test_table.upsertOne({
        select: {
          json: true
        },
        insert: {
          json: {
            foo: 'abc',
            bar: true,
            baz: null,
            qux: '2024-07-01T08:00:00.000Z'
          },
          id
        },
        update: {
          json: {
            foo: 'def',
            bar: false,
            baz: 123,
            qux: '1991-04-23T00:00:00.000Z'
          }
        },
        where: {
          id
        }
      });
    };

    const resultA = await upsert();

    deepEqual(resultA, {
      json: {
        foo: 'abc',
        bar: true,
        baz: null,
        qux: '2024-07-01T08:00:00.000Z'
      }
    });

    const resultB = await upsert();

    deepEqual(resultB, {
      json: {
        foo: 'abc',
        bar: true,
        baz: null,
        qux: '2024-07-01T08:00:00.000Z'
      }
    });

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
        foo: 'def',
        bar: false,
        baz: 123,
        qux: '1991-04-23T00:00:00.000Z'
      }
    });
  });

  it('assert :: upsert one and select json (single field)', async () => {
    const upsert = () => {
      return client.ez4_test_table.upsertOne({
        select: {
          json: {
            baz: true
          }
        },
        insert: {
          json: {
            foo: 'abc',
            bar: false,
            baz: 123,
            qux: '1991-04-23T00:00:00.000Z'
          },
          id
        },
        update: {
          json: {
            foo: 'def'
          }
        },
        where: {
          id
        }
      });
    };

    const resultA = await upsert();

    deepEqual(resultA, {
      json: {
        baz: 123
      }
    });

    const resultB = await upsert();

    deepEqual(resultB, {
      json: {
        baz: 123
      }
    });

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
        bar: false,
        baz: 123,
        qux: '1991-04-23T00:00:00.000Z',

        // Updates
        foo: 'def'
      }
    });
  });

  it('assert :: upsert one and select json (multiple field)', async () => {
    const upsert = () => {
      return client.ez4_test_table.upsertOne({
        select: {
          json: {
            foo: true,
            baz: true
          }
        },
        insert: {
          json: {
            foo: 'abc',
            bar: false,
            baz: 123,
            qux: '1991-04-23T00:00:00.000Z'
          },
          id
        },
        update: {
          json: {
            foo: 'def',
            baz: 321
          }
        },
        where: {
          id
        }
      });
    };

    const resultA = await upsert();

    deepEqual(resultA, {
      json: {
        foo: 'abc',
        baz: 123
      }
    });

    const resultB = await upsert();

    deepEqual(resultB, {
      json: {
        foo: 'abc',
        baz: 123
      }
    });

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
        bar: false,
        qux: '1991-04-23T00:00:00.000Z',

        // Updates
        foo: 'def',
        baz: 321
      }
    });
  });

  it('assert :: upsert one and select json (null fields)', async () => {
    const resultA = await client.ez4_test_table.upsertOne({
      select: {
        json: true
      },
      insert: {
        id
      },
      update: {
        json: null
      },
      where: {
        id
      }
    });

    deepEqual(resultA, {
      json: null
    });

    const resultB = await client.ez4_test_table.upsertOne({
      select: {
        json: true
      },
      insert: {
        id
      },
      update: {
        json: {
          foo: 'abc',
          bar: false,
          baz: 123,
          qux: '1991-04-23T00:00:00.000Z'
        }
      },
      where: {
        id
      }
    });

    deepEqual(resultB, {
      json: null
    });

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
        foo: 'abc',
        bar: false,
        baz: 123,
        qux: '1991-04-23T00:00:00.000Z'
      }
    });
  });
});
