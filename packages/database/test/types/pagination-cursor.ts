import type { Client, Database, ParametersMode, TransactionMode, OrderMode, PaginationMode, Index } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';

declare class TestTable implements Database.Schema {
  id: string;
  next_id: string;
  value: number;
}

export declare class TestDatabase extends Database.Service {
  engine: {
    parametersMode: ParametersMode.OnlyIndex;
    transactionMode: TransactionMode.Static;
    paginationMode: PaginationMode.Cursor;
    orderMode: OrderMode.AnyColumns;
    name: 'test';
  };

  client: Client<TestDatabase>;

  tables: [
    {
      name: 'table';
      schema: TestTable;
      relations: {
        'next_id@next': 'table:id';
      };
      indexes: {
        id: Index.Primary;
      };
    }
  ];

  services: {
    selfClient: Environment.Service<TestDatabase>;
  };
}

export async function testHandler({ selfClient }: Service.Context<TestDatabase>) {
  // Paginate using cursor.
  selfClient.table.findMany({
    select: {
      id: true,
      value: true
    },
    cursor: 'foo-bar',
    limit: 5
  });

  // Paginate using cursor in the sub-query.
  selfClient.table.findMany({
    select: {
      id: true,
      value: true
    },
    include: {
      next: {
        cursor: 'foo-bar',
        limit: 5
      }
    }
  });
}
