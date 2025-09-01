import type { Client, Database, PaginationMode, Index } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEnginePagination } from '../common/engines';

declare class TestTable implements Database.Schema {
  id: string;
  next_id: string;
  value: number;
}

export declare class TestDatabase extends Database.Service {
  engine: TestEnginePagination<PaginationMode.Offset>;

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
    skip: 5,
    take: 5
  });

  // Paginate using cursor in the sub-query.
  selfClient.table.findMany({
    select: {
      id: true,
      value: true,
      next: true
    },
    include: {
      next: {
        skip: 5,
        take: 5
      }
    }
  });
}
