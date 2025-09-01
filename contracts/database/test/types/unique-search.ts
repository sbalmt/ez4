import type { Client, Database, Index } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  client: Client<TestDatabase>;

  tables: [
    {
      name: 'table';
      indexes: {
        id: Index.Primary;
        'unique_idx_p1:unique_idx_p2': Index.Unique;
        unique_idx: Index.Unique;
      };
      schema: {
        id: string;
        value: number;
        unique_idx_p1: number;
        unique_idx_p2: string;
        unique_idx: number;
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
      unique_idx: 123
    }
  });
};

export const testUpdate = ({ selfClient }: Service.Context<TestDatabase>) => {
  return selfClient.table.updateOne({
    data: {
      value: 123
    },
    where: {
      unique_idx_p1: 456,
      unique_idx_p2: 'foo'
    }
  });
};

export const testUpsert = ({ selfClient }: Service.Context<TestDatabase>) => {
  return selfClient.table.upsertOne({
    insert: {
      id: 'foo',
      value: 123,
      unique_idx_p1: 456,
      unique_idx_p2: 'bar',
      unique_idx: 789
    },
    update: {
      value: 456
    },
    where: {
      unique_idx: 789
    }
  });
};

export const testDelete = ({ selfClient }: Service.Context<TestDatabase>) => {
  return selfClient.table.deleteOne({
    where: {
      unique_idx_p1: 123,
      unique_idx_p2: 'foo'
    }
  });
};
