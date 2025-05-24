import type { Client, Database, Index, OrderMode } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngineOrder } from '../common/engines.js';

import { Order } from '@ez4/database';

declare class TestTable implements Database.Schema {
  id: string;
  next_id: string;
  value: number;
}

export declare class TestDatabase extends Database.Service {
  engine: TestEngineOrder<OrderMode.AnyColumns>;

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
  // Order by any column in the main query.
  selfClient.table.findMany({
    select: {
      id: true,
      value: true
    },
    order: {
      value: Order.Desc
    }
  });

  // Order by any column in the sub-query.
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
