import type { Client, Database, Index } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngine } from '../common/engines.js';

declare class TestTable implements Database.Schema {
  id: string;
  value: number;
}

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  client: Client<TestDatabase>;

  tables: [
    {
      name: 'table';
      schema: TestTable;
      indexes: {
        id: Index.Primary;
      };
    }
  ];

  services: {
    selfClient: Environment.Service<TestDatabase>;
  };
}

export const testSelect = ({ selfClient }: Service.Context<TestDatabase>) => {
  return selfClient.table.findOne({
    select: {},
    where: {
      id: 'foo'
    }
  });
};

export const testUpdate = ({ selfClient }: Service.Context<TestDatabase>) => {
  return selfClient.table.updateOne({
    data: {
      value: 123
    },
    where: {
      id: 'foo'
    }
  });
};

export const testUpsert = ({ selfClient }: Service.Context<TestDatabase>) => {
  return selfClient.table.upsertOne({
    insert: {
      id: 'foo',
      value: 123
    },
    update: {
      value: 456
    },
    where: {
      id: 'foo'
    }
  });
};

export const testDelete = ({ selfClient }: Service.Context<TestDatabase>) => {
  return selfClient.table.deleteOne({
    where: {
      id: 'foo'
    }
  });
};
