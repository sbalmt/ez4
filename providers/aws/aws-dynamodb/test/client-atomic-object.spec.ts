import type { Database, Index, Client as DbClient } from '@ez4/database';
import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { EntryStates } from '@ez4/stateful';
import type { Object } from '@ez4/schema';

import { ok, equal, deepEqual } from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { createTable, isTableState, AttributeType, AttributeKeyType, registerTriggers } from '@ez4/aws-dynamodb';
import { Client } from '@ez4/aws-dynamodb/client';
import { SchemaType } from '@ez4/schema';
import { deploy } from '@ez4/aws-common';
import { getRandomUUID } from '@ez4/utils';

declare class TestSchema implements Database.Schema {
  id: string;
  extensible_json: Object.Any;
  json: {
    foo: string;
    bar?: number;
    baz: boolean;
  };
}

declare class TestDatabase extends Database.Service<DynamoDbEngine> {
  tables: [
    {
      name: 'testTable';
      schema: TestSchema;
      indexes: {
        id: Index.Primary;
      };
    }
  ];
}

describe('dynamodb client (atomic object operation)', { timeout: 60000 }, () => {
  let lastState: EntryStates | undefined;
  let dbClient: DbClient<TestDatabase> | undefined;
  let tableId: string | undefined;

  const tableName = 'ez4-test-table-client-atomic-object-operation';

  const id = getRandomUUID();

  registerTriggers();

  beforeEach(async () => {
    await dbClient?.testTable.insertOne({
      data: {
        json: {
          foo: 'abc',
          baz: false
        },
        extensible_json: {
          foo: 'abc',
          bar: 123
        },
        id
      }
    });
  });

  afterEach(async () => {
    await dbClient?.testTable.deleteOne({
      where: {
        id
      }
    });
  });

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createTable(localState, {
      tableName,
      allowDeletion: true,
      attributeSchema: [
        [
          {
            attributeName: 'id',
            attributeType: AttributeType.String,
            keyType: AttributeKeyType.Hash
          }
        ]
      ]
    });

    tableId = resource.entryId;

    const { result } = await deploy(localState, undefined);

    const resultResource = result[tableId];

    ok(resultResource && isTableState(resultResource));
    ok(resultResource.result);

    lastState = result;

    dbClient = Client.make<TestDatabase>({
      repository: {
        testTable: {
          name: tableName,
          indexes: [['id']],
          schema: {
            type: SchemaType.Object,
            properties: {
              id: {
                type: SchemaType.String
              },
              json: {
                type: SchemaType.Object,
                properties: {
                  foo: {
                    type: SchemaType.String
                  },
                  bar: {
                    type: SchemaType.Number,
                    optional: true,
                    nullable: true
                  },
                  baz: {
                    type: SchemaType.Boolean
                  }
                }
              },
              extensible_json: {
                type: SchemaType.Object,
                properties: {},
                definitions: {
                  extensible: true
                }
              }
            }
          }
        }
      }
    });

    ok(dbClient);
  });

  it('assert :: combine objects', async () => {
    ok(dbClient);

    await dbClient.testTable.updateOne({
      data: {
        json: {
          bar: 123,
          baz: true
        }
      },
      where: {
        id
      }
    });

    const result = await dbClient.testTable.findOne({
      select: {
        json: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      json: {
        foo: 'abc',
        bar: 123,
        baz: true
      }
    });
  });

  it('assert :: replace object', async () => {
    ok(dbClient);

    await dbClient.testTable.updateOne({
      data: {
        json: {
          replaceWith: {
            foo: 'def',
            baz: true
          }
        }
      },
      where: {
        id
      }
    });

    const result = await dbClient.testTable.findOne({
      select: {
        json: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      json: {
        foo: 'def',
        baz: true
      }
    });
  });

  it('assert :: combine objects (extensible)', async () => {
    ok(dbClient);

    await dbClient.testTable.updateOne({
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

    const result = await dbClient.testTable.findOne({
      select: {
        extensible_json: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
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
    ok(dbClient);

    await dbClient.testTable.updateOne({
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

    const result = await dbClient.testTable.findOne({
      select: {
        extensible_json: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
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

  it('assert :: destroy', async () => {
    ok(tableId && lastState);
    ok(lastState[tableId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[tableId], undefined);

    dbClient = undefined;
  });
});
