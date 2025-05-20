import type { Client, Database, ParametersMode, TransactionMode, PaginationMode, OrderMode, Index } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';

import { Order } from '@ez4/database';

declare class TestTable implements Database.Schema {
  id: string;
  next_id: string;
  value: number;
}

export declare class TestDatabase extends Database.Service {
  engine: {
    parametersMode: ParametersMode.OnlyIndex;
    transactionMode: TransactionMode.Static;
    paginationMode: PaginationMode.Offset;
    orderMode: OrderMode.IndexColumns;
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
        value: Index.Secondary;
      };
    }
  ];

  services: {
    selfClient: Environment.Service<TestDatabase>;
  };
}

export async function testHandler({ selfClient }: Service.Context<TestDatabase>) {
  // Order by index column in the main query.
  selfClient.table.findMany({
    select: {
      id: true,
      value: true
    },
    order: {
      value: Order.Desc
    }
  });

  // Order by index column in the sub-query.
  selfClient.table.findMany({
    select: {
      id: true,
      value: true
    },
    include: {
      next: {
        order: {
          value: Order.Asc
        }
      }
    }
  });
}
