import type { Client, Database, Index } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngine } from '../common/engines';

declare class TestTableA implements Database.Schema {
  id: string;
  value_a: {
    foo: string;
    bar?: boolean;
  };
}

declare class TestTableB implements Database.Schema {
  id: string;
  table_a_id: string;
  value_b: {
    baz?: number;
    qux: {
      nestedA: string;
      nestedB?: boolean;
      nestedC: number;
    };
  };
}

export declare class TestDatabase extends Database.Service<TestEngine> {
  client: Client<TestDatabase>;

  tables: [
    Database.UseTable<{
      name: 'tableA';
      schema: TestTableA;
      relations: {
        'id@all_relations_b': 'tableB:table_a_id';
      };
      indexes: {
        id: Index.Primary;
      };
    }>,
    Database.UseTable<{
      name: 'tableB';
      schema: TestTableB;
      relations: {
        'table_a_id@relation_a': 'tableA:id';
      };
      indexes: {
        id: Index.Primary;
        table_a_id: Index.Secondary;
      };
    }>
  ];

  services: {
    selfClient: Environment.Service<TestDatabase>;
  };
}

export const testUpdate = async ({ selfClient }: Service.Context<TestDatabase>) => {
  // Update tableA and all tableB connections (with combine)
  await selfClient.tableA.updateOne({
    data: {
      value_a: {
        bar: true
      },
      all_relations_b: {
        value_b: {
          baz: 123
        }
      }
    },
    where: {
      id: 'foo'
    }
  });

  // Update tableA and all tableB connections (with replace)
  await selfClient.tableA.updateOne({
    data: {
      value_a: {
        replaceWith: {
          foo: 'abc'
        }
      },
      all_relations_b: {
        value_b: {
          replaceWith: {
            baz: 123,
            qux: {
              nestedA: 'def',
              nestedC: 456
            }
          }
        }
      }
    },
    where: {
      id: 'foo'
    }
  });

  // Update tableB and the connected tableA (with combine)
  await selfClient.tableB.updateOne({
    data: {
      value_b: {
        baz: 123,
        qux: {
          nestedA: 'abc'
        }
      },
      relation_a: {
        value_a: {
          bar: true
        }
      }
    },
    where: {
      id: 'bar'
    }
  });

  // Update tableB and the connected tableA (with replace)
  await selfClient.tableB.updateOne({
    data: {
      value_b: {
        replaceWith: {
          qux: {
            nestedA: 'abc',
            nestedC: 123
          }
        }
      },
      relation_a: {
        value_a: {
          replaceWith: {
            foo: 'abc',
            bar: true
          }
        }
      }
    },
    where: {
      id: 'bar'
    }
  });

  // Update tableB and the connected tableA (with combine and replace)
  await selfClient.tableB.updateOne({
    data: {
      value_b: {
        baz: 123,
        qux: {
          replaceWith: {
            nestedA: 'abc',
            nestedC: 456
          }
        }
      },
      relation_a: {
        value_a: {
          bar: true
        }
      }
    },
    where: {
      id: 'bar'
    }
  });
};
