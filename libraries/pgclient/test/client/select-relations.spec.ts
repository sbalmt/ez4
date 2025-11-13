import { deleteRelationTables, makeRelationClient, prepareRelationTables } from './common/relation';

import { after, before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

describe('client select relations', async () => {
  const client = await makeRelationClient();

  const idA = randomUUID();
  const idB = randomUUID();
  const idC = randomUUID();

  const idU1 = randomUUID();
  const idU2 = randomUUID();

  before(async () => {
    await prepareRelationTables(client);

    await client.table_c.insertOne({
      data: {
        id_c: idC,
        unique_2_id: idU2,
        value: 'tableC',
        relation: {
          id_b: idU1,
          value: 'tableB2'
        }
      }
    });

    await client.table_b.insertOne({
      data: {
        id_b: idB,
        value: 'tableB',
        relation: {
          unique_1_id: idU1
        },
        relations: [
          {
            id_a: randomUUID(),
            value: 'tableA2'
          }
        ]
      }
    });

    await client.table_a.insertOne({
      data: {
        id_a: idA,
        value: 'tableA',
        relation_1: {
          id_b: idB
        },
        relation_2: {
          unique_2_id: idU2
        }
      }
    });
  });

  after(async () => {
    await deleteRelationTables(client);
  });

  it('assert :: select relation (multiple levels)', async () => {
    const result = await client.table_a.findOne({
      select: {
        value: true,
        relation_1: {
          value: true,
          relation: {
            value: true
          },
          relations: {
            value: true,
            relation_1: {
              value: true
            },
            relation_2: {
              value: true
            }
          }
        },
        relation_2: {
          value: true
        }
      },
      where: {
        id_a: idA
      }
    });

    deepEqual(result, {
      value: 'tableA',
      relation_1: {
        value: 'tableB',
        relation: {
          value: 'tableC'
        },
        relations: [
          {
            value: 'tableA2',
            relation_1: {
              value: 'tableB'
            },
            relation_2: null
          },
          {
            value: 'tableA',
            relation_1: {
              value: 'tableB'
            },
            relation_2: {
              value: 'tableC'
            }
          }
        ]
      },
      relation_2: {
        value: 'tableC'
      }
    });
  });

  it('assert :: select relation (multiple levels with include)', async () => {
    const result = await client.table_a.findOne({
      select: {
        value: true,
        relation_1: {
          value: true,
          relation: {
            value: true
          },
          relations: {
            value: true,
            relation_1: {
              value: true
            },
            relation_2: {
              value: true
            }
          }
        },
        relation_2: {
          value: true
        }
      },
      include: {
        relation_1: {
          where: {
            value: 'tableB'
          },
          take: 1
        },
        relation_2: {
          where: {
            value: 'tableC'
          }
        }
      },
      where: {
        id_a: idA
      }
    });

    deepEqual(result, {
      value: 'tableA',
      relation_1: {
        value: 'tableB',
        relation: {
          value: 'tableC'
        },
        relations: [
          {
            value: 'tableA2',
            relation_1: {
              value: 'tableB'
            },
            relation_2: null
          },
          {
            value: 'tableA',
            relation_1: {
              value: 'tableB'
            },
            relation_2: {
              value: 'tableC'
            }
          }
        ]
      },
      relation_2: {
        value: 'tableC'
      }
    });
  });
});
