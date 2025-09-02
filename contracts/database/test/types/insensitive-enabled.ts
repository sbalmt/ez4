import type { Client, Database, Index, InsensitiveMode } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngineInsensitive } from '../common/engines';

declare class TestTable implements Database.Schema {
  id: string;
  next_id: string;
  text: string;
}

export declare class TestDatabase extends Database.Service {
  engine: TestEngineInsensitive<InsensitiveMode.Enabled>;

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

export async function testWhere({ selfClient }: Service.Context<TestDatabase>) {
  // Insensitive in the main query.
  selfClient.table.findMany({
    select: {
      id: true
    },
    where: {
      text: {
        insensitive: true,
        contains: 'foo'
      }
    }
  });

  // Insensitive in the sub-query.
  selfClient.table.findMany({
    select: {
      id: true,
      next: true
    },
    include: {
      next: {
        where: {
          text: {
            insensitive: true,
            startsWith: 'bar'
          }
        }
      }
    }
  });
}

export async function testOperators({ selfClient }: Service.Context<TestDatabase>) {
  // Contains operator
  selfClient.table.findMany({
    select: {
      id: true
    },
    where: {
      text: {
        insensitive: true,
        contains: 'foo'
      }
    }
  });

  // Starts With operator
  selfClient.table.findMany({
    select: {
      id: true
    },
    where: {
      text: {
        insensitive: true,
        startsWith: 'foo'
      }
    }
  });

  // Equals operator
  selfClient.table.findMany({
    select: {
      id: true
    },
    where: {
      text: {
        insensitive: true,
        equal: 'foo'
      }
    }
  });

  // Not equals operator
  selfClient.table.findMany({
    select: {
      id: true
    },
    where: {
      text: {
        insensitive: true,
        not: 'foo'
      }
    }
  });
}
