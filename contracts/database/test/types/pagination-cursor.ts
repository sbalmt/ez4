import type { Client, Database, PaginationMode, Index } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEnginePagination } from '../common/engines';

declare class TestTable implements Database.Schema {
  id: string;
  next_id: string;
  value: number;
}

export declare class TestDatabase extends Database.Service {
  engine: TestEnginePagination<PaginationMode.Cursor>;

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
  const resultA = await selfClient.table.findMany({
    select: {
      id: true,
      value: true
    },
    cursor: 'foo-bar',
    limit: 5
  });

  resultA.cursor;

  // Paginate using cursor in the sub-query.
  const resultB = await selfClient.table.findMany({
    select: {
      id: true,
      value: true,
      next: true
    },
    include: {
      next: {
        cursor: 'foo-bar',
        limit: 5
      }
    }
  });

  resultB.cursor;
}
